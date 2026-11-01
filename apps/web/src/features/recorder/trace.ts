/** The pen doesn't ink above this height, so the axis labels stay readable. */
export const INK_START = 42;

const STEP = 5;
const PADDING = 12;

export interface TraceStop {
  y: number;
  /** 0 is the metal, 1 is the model. */
  x: number;
}

export interface Trace {
  /** Pen x for every STEP px of paper. */
  xs: number[];
  d: string;
  dots: { x: number; y: number }[];
}

/** Same seed, same line, so the chart doesn't change between visits or resizes. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

export function buildTrace(entries: TraceStop[], height: number, lane: number): Trace {
  const first = entries[0];
  const last = entries.at(-1);
  if (!first || !last) return { xs: [], d: '', dots: [] };

  const stops = [{ y: 0, x: first.x }, ...entries, { y: height, x: last.x }];
  const random = seededRandom(4242);
  const width = Math.max(lane - PADDING * 2, 30);
  const xs: number[] = [];
  let segment = 0;
  let chatter = 0;

  for (let y = 0; y <= height; y += STEP) {
    while (segment < stops.length - 2 && y >= (stops[segment + 1]?.y ?? Infinity)) segment++;
    const a = stops[segment] ?? first;
    const b = stops[segment + 1] ?? last;
    // The pen holds, then swings over the last stretch before the next entry, with overshoot.
    const band = Math.max(1, Math.min(120, (b.y - a.y) * 0.5));
    const t = Math.max(0, Math.min(1, (y - (b.y - band)) / band));
    const eased = t * t * (3 - 2 * t) + Math.sin(t * Math.PI) * 0.08 * Math.sign(b.x - a.x);
    chatter = chatter * 0.72 + (random() - 0.5) * 0.022;
    const wander = Math.sin(y / 61) * 0.009 + Math.sin(y / 17.3) * 0.005;
    const value = a.x + (b.x - a.x) * eased + chatter + wander;
    xs.push(PADDING + Math.max(0.01, Math.min(0.99, value)) * width);
  }

  return {
    xs,
    d: 'M' + xs.map((x, i) => `${x.toFixed(1)} ${i * STEP}`).join('L'),
    dots: entries.map(({ y }) => ({ x: penX(xs, y), y })),
  };
}

export function penX(xs: number[], y: number): number {
  return xs[Math.max(0, Math.min(xs.length - 1, Math.round(y / STEP)))] ?? 0;
}
