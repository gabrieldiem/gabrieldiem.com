import type { BenchModel } from '../../content/models';

export type Station = Omit<BenchModel, 'kind'> & { kind: BenchModel['kind'] | 'you' };

export const YOU = 'You';

export function stationsFor(models: BenchModel[], you: number | null, fresh: boolean): Station[] {
  const stations: Station[] = [...models];
  if (you !== null) {
    const beaten = models.filter((model) => model.score < you).length;
    stations.push({
      name: YOU,
      full: YOU,
      score: you,
      kind: 'you',
      remark: fresh
        ? `Ahead of ${beaten} of the ${models.length} models. They averaged twelve tests and you did one, so don't frame it.`
        : `Your score from last time. Ahead of ${beaten} of the ${models.length} models.`,
    });
  }
  return stations.sort((a, b) => a.score - b.score);
}

export interface DialGeometry {
  width: number;
  height: number;
  left: number;
  right: number;
  scaleY: number;
  wide: boolean;
}

export const DIAL_WIDE: DialGeometry = {
  width: 1200,
  height: 300,
  left: 34,
  right: 1148,
  scaleY: 232,
  wide: true,
};

export const DIAL_NARROW: DialGeometry = {
  width: 420,
  height: 96,
  left: 18,
  right: 402,
  scaleY: 28,
  wide: false,
};

/** Where a score sits on the scale. */
export function scaleX(geometry: DialGeometry, score: number): number {
  return geometry.left + ((score - 1) / 19) * (geometry.right - geometry.left);
}

/** Names are evenly spaced above the scale, each with a leader to its real score. */
export function labelX(geometry: DialGeometry, index: number, count: number): number {
  return (
    geometry.left + 4 + index * ((geometry.right - geometry.left - 60) / Math.max(1, count - 1))
  );
}

/** The station nearest a point on the dial: by name up in the labels, by score on the scale. */
export function pickStation(
  geometry: DialGeometry,
  stations: Station[],
  x: number,
  y: number,
): number {
  const byLabel = geometry.wide && y < geometry.scaleY - 40;
  let best = 0;
  let bestDistance = Infinity;
  stations.forEach((station, index) => {
    const px = byLabel ? labelX(geometry, index, stations.length) : scaleX(geometry, station.score);
    const distance = Math.abs(px - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

export function scoreLine(station: Station): string {
  const score = `${station.score.toFixed(1)} out of 20`;
  if (station.kind === 'you') return `${score}, on one question`;
  return `${score}, ${station.kind === 'cloud' ? 'cloud' : 'running locally'}`;
}
