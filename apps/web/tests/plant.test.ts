import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadCheckpoint } from '../src/features/plant/checkpoint';
import {
  formatClock,
  preferredOwner,
  servingReplica,
  tieOwner,
  type Plant,
} from '../src/features/plant/plant';
import { linkedChannels, services } from './plantFixtures';

const ALL_UP = { 1: true, 2: true, 3: true };

/** Run every pending failover timer. */
const settle = () => vi.advanceTimersByTimeAsync(3000);
const logText = (plant: Plant) =>
  plant
    .getState()
    .log.map((line) => line.text)
    .join('\n');

describe('failover rules', () => {
  it('prefers the section’s own replica, then its neighbour', () => {
    expect(preferredOwner(2, ALL_UP)).toBe(2);
    expect(preferredOwner(2, { ...ALL_UP, 2: false })).toBe(1);
    expect(preferredOwner(1, { ...ALL_UP, 1: false })).toBe(2);
    expect(preferredOwner(3, { ...ALL_UP, 3: false })).toBe(2);
    expect(preferredOwner(1, { 1: false, 2: false, 3: true })).toBe(3);
    expect(preferredOwner(1, { 1: false, 2: false, 3: false })).toBe(0);
  });

  it('serves the session from the first live replica', () => {
    expect(servingReplica(ALL_UP)).toBe(1);
    expect(servingReplica({ 1: false, 2: true, 3: true })).toBe(2);
    expect(servingReplica({ 1: false, 2: false, 3: false })).toBe(0);
  });

  it('only energises a tie while one neighbour feeds the other', () => {
    expect(tieOwner(1, 2, { 1: 1, 2: 2, 3: 3 }, ALL_UP)).toBe(0);
    expect(tieOwner(1, 2, { 1: 1, 2: 1, 3: 3 }, { ...ALL_UP, 2: false })).toBe(1);
    expect(tieOwner(2, 3, { 1: 1, 2: 1, 3: 3 }, { ...ALL_UP, 2: false })).toBe(0);
  });

  it('formats the on-site clock', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(83)).toBe('01:23');
  });
});

describe('Plant', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('drops a tripped section, then hands it to a survivor', async () => {
    const { plant } = services();
    plant.toggle(2);
    expect(plant.getState().alive[2]).toBe(false);
    expect(plant.getState().owners[2]).toBe(0);
    await settle();
    expect(plant.getState().owners).toEqual({ 1: 1, 2: 1, 3: 3 });
    expect(logText(plant)).toContain('G1 read the checkpoint');
  });

  it('gives letters back when a replica returns', async () => {
    const { plant } = services();
    plant.toggle(2);
    await settle();
    plant.toggle(2);
    await settle();
    expect(plant.getState().owners).toEqual({ 1: 1, 2: 2, 3: 3 });
  });

  it('goes dark with the last replica and keeps the session through a black start', async () => {
    const { plant, checkpoint } = services();
    plant.toggle(1);
    plant.toggle(2);
    plant.toggle(3);
    await settle();
    expect(plant.getState().dark).toBe(true);
    expect(checkpoint.trips).toBe(3);

    const started = plant.blackStart();
    expect(plant.getState().starting).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    await started;
    const state = plant.getState();
    expect(state.dark).toBe(false);
    expect(state.alive).toEqual(ALL_UP);
    expect(state.owners).toEqual({ 1: 1, 2: 2, 3: 3 });
    expect(state.trips).toBe(3);
    expect(logText(plant)).toContain('Nothing lost');
  });

  it('cancels the blackout if a breaker closes in time', async () => {
    const { plant } = services();
    plant.toggle(1);
    plant.toggle(2);
    plant.toggle(3);
    plant.toggle(3);
    await settle();
    expect(plant.getState().dark).toBe(false);
    expect(plant.getState().owners[1]).toBe(3);
  });

  it('ignores breakers while dark', async () => {
    const { plant } = services();
    plant.toggle(1);
    plant.toggle(2);
    plant.toggle(3);
    await settle();
    plant.toggle(1);
    expect(plant.getState().alive[1]).toBe(false);
  });

  it('stops the clock in the dark and checkpoints it', async () => {
    const { plant } = services();
    const stop = plant.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(plant.getState().seconds).toBe(5);
    plant.toggle(1);
    plant.toggle(2);
    plant.toggle(3);
    await settle();
    const stopped = plant.getState().seconds;
    await vi.advanceTimersByTimeAsync(10000);
    expect(plant.getState().seconds).toBe(stopped);
    stop();
    expect(loadCheckpoint(localStorage).seconds).toBeGreaterThanOrEqual(5);
  });

  it('restores the session on the next page load', () => {
    const first = services();
    first.plant.toggle(1);
    const second = services();
    expect(second.checkpoint.id).toBe(first.checkpoint.id);
    expect(second.checkpoint.visits).toBe(2);
    expect(second.plant.getState().trips).toBe(1);
    expect(logText(second.plant)).toContain('restored from checkpoint');
  });

  it('shares breakers and blackouts between windows', async () => {
    const [a, b] = linkedChannels();
    const left = services({ openChannel: () => a }).plant;
    const right = services({ openChannel: () => b }).plant;
    const stopLeft = left.start();
    const stopRight = right.start();
    expect(logText(left)).toContain('Another window joined');

    left.toggle(2);
    await settle();
    expect(right.getState().alive[2]).toBe(false);
    expect(right.getState().owners[2]).toBe(1);

    left.toggle(1);
    left.toggle(3);
    await settle();
    expect(right.getState().dark).toBe(true);

    void left.blackStart();
    await vi.advanceTimersByTimeAsync(5000);
    expect(right.getState().dark).toBe(false);
    stopLeft();
    stopRight();
  });

  it('notices a window that stops answering', async () => {
    const [a, b] = linkedChannels();
    const left = services({ openChannel: () => a }).plant;
    const right = services({ openChannel: () => b }).plant;
    const stopLeft = left.start();
    const stopRight = right.start();
    stopRight();
    await vi.advanceTimersByTimeAsync(6000);
    expect(logText(left)).toContain('Lost the heartbeat');
    stopLeft();
  });
});

describe('checkpoint', () => {
  it('treats corrupt storage as a new session', () => {
    localStorage.setItem('usina.checkpoint.v1', '{not json');
    const checkpoint = loadCheckpoint(localStorage);
    expect(checkpoint.visits).toBe(1);
    expect(checkpoint.you).toBeNull();
  });
});
