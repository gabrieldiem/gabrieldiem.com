import { useRef } from 'react';

import { cx } from '../../components/cx';
import { useMediaQuery } from '../../components/useMediaQuery';
import { DIAL_NARROW, DIAL_WIDE, labelX, pickStation, scaleX, type Station } from './tuner';
import styles from './Tuner.module.css';

const MARKS = Array.from({ length: 20 }, (_, index) => index + 1);

interface DialProps {
  stations: Station[];
  tuned: number;
  onPick: (index: number) => void;
}

/** A backlit radio dial: every model is a station, placed at its score. */
export function Dial({ stations, tuned, onPick }: DialProps) {
  const wide = useMediaQuery('(min-width: 900px)');
  const geometry = wide ? DIAL_WIDE : DIAL_NARROW;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const station = stations[tuned];

  const pickAt = (event: React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    onPick(
      pickStation(
        geometry,
        stations,
        ((event.clientX - box.left) / box.width) * geometry.width,
        ((event.clientY - box.top) / box.height) * geometry.height,
      ),
    );
  };

  return (
    <div
      className={styles.dial}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        pickAt(event);
      }}
      onPointerMove={(event) => {
        if (dragging.current) pickAt(event);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <svg ref={svgRef} viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
        {MARKS.map((mark) => {
          const long = mark % 5 === 0 || mark === 1;
          const x = scaleX(geometry, mark);
          return (
            <g key={mark}>
              <path
                d={`M${x} ${geometry.scaleY}v${long ? 20 : 11}`}
                stroke="#3a230c"
                strokeWidth={long ? 2 : 1}
              />
              {(wide || long) && (
                <text
                  x={x}
                  y={geometry.scaleY + 40}
                  fontSize="15"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {mark}
                </text>
              )}
            </g>
          );
        })}
        <path
          d={`M${geometry.left} ${geometry.scaleY}H${geometry.right}`}
          stroke="#3a230c"
          strokeWidth="2"
        />
        {stations.map((item, index) => {
          const x = scaleX(geometry, item.score);
          const className = cx(index === tuned && styles.tuned, item.kind === 'you' && styles.you);
          if (!wide) {
            return (
              <g key={item.full} className={className}>
                <path
                  d={`M${x} ${geometry.scaleY - 16}V${geometry.scaleY}`}
                  stroke="#3a230c"
                  strokeWidth="1.1"
                />
              </g>
            );
          }
          const lx = labelX(geometry, index, stations.length);
          return (
            <g key={item.full} className={className}>
              <path
                d={`M${lx} 170C${lx} 196 ${x} 196 ${x} ${geometry.scaleY}`}
                fill="none"
                stroke="#3a230c"
                strokeWidth=".7"
                opacity=".75"
              />
              <text transform={`translate(${lx + 3} 165) rotate(-58)`} fontSize="11.5">
                {item.name}
              </text>
            </g>
          );
        })}
        <g
          className={styles.needle}
          data-testid="needle"
          style={{ transform: `translateX(${station ? scaleX(geometry, station.score) : 0}px)` }}
        >
          <path d={`M0 0V${geometry.height}`} stroke="#C81E0C" strokeWidth="3" />
          <path d={`M0 0V${geometry.height}`} stroke="#FFD9C6" strokeWidth=".8" />
        </g>
      </svg>
    </div>
  );
}
