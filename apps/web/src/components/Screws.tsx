import type { CSSProperties } from 'react';

/** The four corner screws of a panel. Their slots point every which way, like real ones. */
export function Screws({ angles }: { angles: [number, number, number, number] }) {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner, index) => (
        <i
          key={corner}
          className={`screw ${corner}`}
          style={{ '--r': `${angles[index]}deg` } as CSSProperties}
        />
      ))}
    </>
  );
}
