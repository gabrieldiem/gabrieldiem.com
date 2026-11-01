import type { Ref } from 'react';

import { GAUGE_CX as CX, GAUGE_CY as CY, needleTransform } from './needle';

const RADIUS = 60;

function point(value: number, radius: number): [number, number] {
  const angle = ((value - 50) * Math.PI) / 180;
  return [CX + radius * Math.sin(angle), CY - radius * Math.cos(angle)];
}

function arc(from: number, to: number): string {
  const [x1, y1] = point(from, RADIUS);
  const [x2, y2] = point(to, RADIUS);
  return `M${x1} ${y1}A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;
}

const TICKS = Array.from({ length: 11 }, (_, index) => {
  const value = index * 10;
  const long = value % 50 === 0;
  const [x1, y1] = point(value, RADIUS);
  const [x2, y2] = point(value, RADIUS - (long ? 10 : 6));
  return { value, long, x1, y1, x2, y2 };
});

/** A panel meter. The needle is moved by the Feeders loop, not by React. */
export function Gauge({ needleRef }: { needleRef: Ref<SVGGElement> }) {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true">
      <rect x="1" y="1" width="138" height="82" rx="6" fill="#120b07" />
      <rect x="6" y="6" width="128" height="72" rx="3" fill="#EFEBD6" />
      <path d={arc(0, 80)} fill="none" stroke="#241710" strokeWidth="1" />
      <path d={arc(80, 100)} fill="none" stroke="#B3261E" strokeWidth="4" />
      {TICKS.map(({ value, long, x1, y1, x2, y2 }) => (
        <line
          key={value}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#241710"
          strokeWidth={long ? 1.6 : 0.8}
        />
      ))}
      <text x="12" y="66" fontFamily="B612" fontSize="7.5" fill="#241710">
        load
      </text>
      <text x="128" y="66" fontFamily="B612" fontSize="7.5" textAnchor="end" fill="#241710">
        %
      </text>
      <g ref={needleRef} transform={needleTransform(0)}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - RADIUS + 5} stroke="#B3261E" strokeWidth="1.6" />
      </g>
      <rect x="6" y="71" width="128" height="7" fill="#2a1d15" />
      <circle cx={CX} cy="71" r="5.5" fill="#120b07" />
    </svg>
  );
}
