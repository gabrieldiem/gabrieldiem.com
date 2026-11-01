export interface Needle {
  position: number;
  velocity: number;
}

const STIFFNESS = 0.022;
const DAMPING = 0.86;

/** One frame of an underdamped meter needle, so it overshoots and settles like a real one. */
export function stepNeedle({ position, velocity }: Needle, target: number): Needle {
  const nextVelocity = (velocity + (target - position) * STIFFNESS) * DAMPING;
  return { position: position + nextVelocity, velocity: nextVelocity };
}

/** Load on a live replica, in percent. The three share the page between them. */
export function loadTarget(aliveCount: number, wobble: number): number {
  return aliveCount > 0 ? 94 / aliveCount + wobble : 0;
}

export const GAUGE_CX = 70;
export const GAUGE_CY = 78;

/** Needle angle for a load in percent. It rests just past the stops, like a real meter. */
export function needleTransform(load: number): string {
  return `rotate(${Math.max(-3, Math.min(103, load)) - 50} ${GAUGE_CX} ${GAUGE_CY})`;
}
