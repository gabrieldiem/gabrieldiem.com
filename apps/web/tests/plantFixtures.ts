import { vi } from 'vitest';

import { loadCheckpoint, type Checkpoint } from '../src/features/plant/checkpoint';
import { Plant, type PlantChannel } from '../src/features/plant/plant';
import type { PlantServices } from '../src/features/plant/plantContext';
import type { Sound } from '../src/features/plant/sound';

export function silentSound(): Sound {
  return { setEnabled: vi.fn(), clunk: vi.fn(), tick: vi.fn(), hum: vi.fn() };
}

export function services(
  options: { openChannel?: () => PlantChannel | null } = {},
): PlantServices & { checkpoint: Checkpoint } {
  const store = localStorage;
  const checkpoint = loadCheckpoint(store);
  const sound = silentSound();
  const plant = new Plant({ store, checkpoint, sound, calm: true, ...options });
  return { plant, sound, checkpoint, calm: true };
}

/** A pair of channels wired together like two windows on one BroadcastChannel. */
export function linkedChannels(): [PlantChannel, PlantChannel] {
  const make = (other: () => PlantChannel): PlantChannel => ({
    onmessage: null,
    close() {},
    postMessage(message) {
      other().onmessage?.({ data: message } as MessageEvent);
    },
  });
  const a: PlantChannel = make(() => b);
  const b: PlantChannel = make(() => a);
  return [a, b];
}
