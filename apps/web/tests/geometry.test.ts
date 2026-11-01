import { describe, expect, it } from 'vitest';

import { MODELS } from '../src/content/models';
import { buildCircuit, LAYOUTS } from '../src/features/board/nameCircuit';
import { loadTarget, stepNeedle } from '../src/features/board/needle';
import { buildTrace, penX } from '../src/features/recorder/trace';
import {
  DIAL_NARROW,
  DIAL_WIDE,
  labelX,
  pickStation,
  scaleX,
  scoreLine,
  stationsFor,
  YOU,
} from '../src/features/tuner/tuner';

describe('name circuit', () => {
  for (const name of ['wide', 'narrow'] as const) {
    it(`${name}: three feeds line up with the three breaker columns`, () => {
      const circuit = buildCircuit(LAYOUTS[name]);
      const width = LAYOUTS[name].w;
      const xs = circuit.stubs.map(({ d }) => parseFloat(d.slice(1)) / width);
      expect(xs[0]).toBeCloseTo(1 / 6, 2);
      expect(xs[1]).toBeCloseTo(1 / 2, 2);
      expect(xs[2]).toBeCloseTo(5 / 6, 2);
    });

    it(`${name}: draws all eleven letters of the name`, () => {
      const letters = LAYOUTS[name].letters.map(({ ch }) => ch).join('');
      expect(letters).toBe('GABRIELDIEM');
      expect(() => buildCircuit(LAYOUTS[name])).not.toThrow();
    });
  }
});

describe('load meter', () => {
  it('shares the load between live replicas', () => {
    expect(loadTarget(3, 0)).toBeCloseTo(31.3, 1);
    expect(loadTarget(1, 0)).toBe(94);
    expect(loadTarget(0, 5)).toBe(0);
  });

  it('overshoots its target and settles on it', () => {
    let needle = { position: 0, velocity: 0 };
    let peak = 0;
    for (let frame = 0; frame < 400; frame++) {
      needle = stepNeedle(needle, 50);
      peak = Math.max(peak, needle.position);
    }
    expect(peak).toBeGreaterThan(50);
    expect(needle.position).toBeCloseTo(50, 1);
  });
});

describe('pen trace', () => {
  const stops = [
    { y: 100, x: 0.9 },
    { y: 500, x: 0.1 },
    { y: 900, x: 0.8 },
  ];

  it('is the same line every time', () => {
    expect(buildTrace(stops, 1000, 300).d).toBe(buildTrace(stops, 1000, 300).d);
  });

  it('stays inside the lane and reaches each entry near its position', () => {
    const { xs, dots } = buildTrace(stops, 1000, 300);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(300);
    expect(dots).toHaveLength(3);
    const toLane = (x: number) => 12 + x * (300 - 24);
    stops.forEach(({ x }, index) => {
      expect(Math.abs((dots[index]?.x ?? 0) - toLane(x))).toBeLessThan(30);
    });
  });

  it('starts on the latest entry and clamps lookups', () => {
    const { xs } = buildTrace(stops, 1000, 300);
    expect(penX(xs, -50)).toBe(xs[0]);
    expect(penX(xs, 99999)).toBe(xs.at(-1));
  });

  it('survives an empty timeline', () => {
    expect(buildTrace([], 1000, 300).xs).toEqual([]);
  });
});

describe('tuner', () => {
  it('sorts stations by score, low to high', () => {
    const scores = stationsFor(MODELS, null, false).map(({ score }) => score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it('puts the visitor on the dial and counts who they beat', () => {
    const stations = stationsFor(MODELS, 20, true);
    const you = stations.find(({ name }) => name === YOU);
    expect(stations).toHaveLength(MODELS.length + 1);
    expect(you?.remark).toContain(`Ahead of ${MODELS.length} of the ${MODELS.length}`);
    expect(you && scoreLine(you)).toBe('20.0 out of 20, on one question');
    expect(stationsFor(MODELS, 3, false).find(({ name }) => name === YOU)?.remark).toContain(
      'Your score from last time',
    );
  });

  it('places scores along the scale', () => {
    expect(scaleX(DIAL_WIDE, 1)).toBe(DIAL_WIDE.left);
    expect(scaleX(DIAL_WIDE, 20)).toBe(DIAL_WIDE.right);
  });

  it('picks by score on the scale and by name up in the labels', () => {
    const stations = stationsFor(MODELS, null, false);
    const last = stations.length - 1;
    expect(pickStation(DIAL_NARROW, stations, DIAL_NARROW.right, 30)).toBe(last);
    expect(pickStation(DIAL_NARROW, stations, DIAL_NARROW.left, 30)).toBe(0);
    const middle = 20;
    expect(pickStation(DIAL_WIDE, stations, labelX(DIAL_WIDE, middle, stations.length), 50)).toBe(
      middle,
    );
  });
});
