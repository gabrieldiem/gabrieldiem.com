import type { Replica, Section } from '../plant/plant';

/** Every letter of the name is a piece of single-line electrical diagram, 6 units tall. */
interface Glyph {
  d: string;
  /** Where the letter drops down to its bus, in local x. */
  drops: number[];
  /** Breakers (`s`) and terminals (`t`) sitting on the line. */
  marks: ['s' | 't', number, number][];
}

const GLYPHS: Record<string, Glyph> = {
  G: { d: 'M4 1.1 3 0H1L0 1V5L1 6H3L4 5V3H2.2', drops: [2], marks: [['t', 2.2, 3]] },
  A: { d: 'M0 6V2L2 0 4 2V6M0 3.7H4', drops: [0, 4], marks: [['s', 2, 3.7]] },
  B: {
    d: 'M0 0V6M0 0H2.6A1.45 1.45 0 0 1 2.6 2.9H0M2.6 2.9H2.7A1.55 1.55 0 0 1 2.7 6H0',
    drops: [0],
    marks: [],
  },
  R: { d: 'M0 6V0H2.6A1.6 1.6 0 0 1 2.6 3.2H0M2 3.2 4 6', drops: [0, 4], marks: [['s', 3, 4.6]] },
  I: { d: 'M.5 0V6', drops: [0.5], marks: [['s', 0.5, 3]] },
  E: {
    d: 'M4 0H0V6H4M0 3H3',
    drops: [2],
    marks: [
      ['t', 4, 0],
      ['t', 3, 3],
      ['t', 4, 6],
    ],
  },
  L: { d: 'M0 0V6H3.3', drops: [0], marks: [['t', 3.3, 6]] },
  D: { d: 'M0 0V6H1.7A2.3 3 0 0 0 1.7 0H0', drops: [0], marks: [] },
  M: { d: 'M0 6V0L2.5 3.2 5 0V6', drops: [0, 5], marks: [['s', 2.5, 3.2]] },
};

interface PlacedLetter {
  ch: string;
  x: number;
  y: number;
  scale: number;
  section: Section;
  /** Replaces the glyph's drops when a neighbour's wiring is in the way. */
  drops?: number[];
}

interface Layout {
  w: number;
  h: number;
  mid: number;
  low: number;
  letters: PlacedLetter[];
  wires: Record<Section, string[]>;
  ties: { a: Section; b: Section; d: string; x: number; y: number }[];
}

const letter = (
  ch: string,
  x: number,
  y: number,
  scale: number,
  section: Section,
  drops?: number[],
): PlacedLetter => (drops ? { ch, x, y, scale, section, drops } : { ch, x, y, scale, section });

const GABRIEL = [
  letter('G', 0, 0, 1, 1),
  letter('A', 5.2, 0, 1, 1),
  letter('B', 10.4, 0, 1, 1),
  letter('R', 15.6, 0, 1, 2),
  letter('I', 20.8, 0, 1, 2),
  letter('E', 23, 0, 1, 3),
  letter('L', 28.2, 0, 1, 3),
];

/**
 * A bus runs between the two lines of the name and another under it, joined by risers and tied
 * at the bottom. `wide` leaves room for the intro next to DIEM; `narrow` scales DIEM to full width.
 */
export const LAYOUTS: Record<'wide' | 'narrow', Layout> = {
  wide: {
    w: 32,
    h: 16,
    mid: 7,
    low: 15.2,
    letters: [
      ...GABRIEL,
      letter('D', 0, 8, 1, 1),
      letter('I', 5, 8, 1, 1),
      letter('E', 8.2, 8, 1, 2),
      letter('M', 13.4, 8, 1, 2),
    ],
    wires: {
      1: ['M2 7H10.4', 'M6.9 7V15.2', 'M0 15.2H6.9'],
      2: ['M15.6 7H21.3', 'M19.4 7V15.2', 'M10.2 15.2H19.4'],
      3: ['M25 7H31.6V15.2H26.67'],
    },
    ties: [
      { a: 1, b: 2, d: 'M6.9 15.2H10.2', x: 8.55, y: 15.2 },
      { a: 2, b: 3, d: 'M19.4 15.2H26.67', x: 23, y: 15.2 },
    ],
  },
  narrow: {
    w: 32,
    h: 21.7,
    mid: 7,
    low: 20.9,
    letters: [
      ...GABRIEL,
      letter('D', 0, 8.6, 1.85, 1),
      letter('I', 8.2, 8.6, 1.85, 1),
      letter('E', 12, 8.6, 1.85, 2),
      letter('M', 21.6, 8.6, 1.85, 3, [5]),
    ],
    wires: {
      1: ['M2 7H10.4', 'M10.9 7V20.9', 'M0 20.9H10.9'],
      2: ['M15.6 7H21.3', 'M20.4 7V20.9', 'M15.7 20.9H20.4'],
      3: ['M25 7H31.6V20.9H26.67'],
    },
    ties: [
      { a: 1, b: 2, d: 'M10.9 20.9H15.7', x: 13.3, y: 20.9 },
      { a: 2, b: 3, d: 'M20.4 20.9H26.67', x: 23.5, y: 20.9 },
    ],
  },
};

/** Where each feed leaves the diagram: the centres of the three breaker columns. */
const STUB_X: Record<Replica, number> = { 1: 5.333, 2: 16, 3: 26.667 };

export interface CircuitPath {
  d: string;
  transform?: string;
  /** Drawn on a scaled-up letter, so it needs thinner strokes to match. */
  big: boolean;
}

export interface CircuitMark {
  kind: 's' | 't';
  x: number;
  y: number;
}

export interface Circuit {
  viewBox: string;
  sections: Record<Section, { paths: CircuitPath[]; marks: CircuitMark[] }>;
  ties: { a: Section; b: Section; d: string; x: number; y: number }[];
  stubs: { replica: Replica; d: string }[];
}

export function buildCircuit(layout: Layout): Circuit {
  const sections: Circuit['sections'] = {
    1: { paths: [], marks: [] },
    2: { paths: [], marks: [] },
    3: { paths: [], marks: [] },
  };

  for (const { ch, x, y, scale, section, drops } of layout.letters) {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`No glyph for ${ch}`);
    const target = sections[section];
    target.paths.push({
      d: glyph.d,
      transform: `translate(${x} ${y}) scale(${scale})`,
      big: scale > 1,
    });
    const bus = y === 0 ? layout.mid : layout.low;
    for (const dx of drops ?? glyph.drops) {
      target.paths.push({ d: `M${x + dx * scale} ${y + 6 * scale}V${bus}`, big: false });
    }
    for (const [kind, mx, my] of glyph.marks) {
      target.marks.push({ kind, x: x + mx * scale, y: y + my * scale });
    }
  }

  for (const section of [1, 2, 3] as const) {
    for (const d of layout.wires[section]) sections[section].paths.push({ d, big: false });
  }

  return {
    viewBox: `0 0 ${layout.w} ${layout.h}`,
    sections,
    ties: layout.ties,
    stubs: ([1, 2, 3] as const).map((replica) => ({
      replica,
      d: `M${STUB_X[replica]} ${layout.low}V${layout.h + 0.1}`,
    })),
  };
}
