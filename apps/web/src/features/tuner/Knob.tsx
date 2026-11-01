import { useRef, type CSSProperties } from 'react';

import styles from './Tuner.module.css';

const DEGREES_PER_STATION = 15;
const PIXELS_PER_STATION = 9;

interface KnobProps {
  tuned: number;
  max: number;
  label: string;
  valueText: string;
  onTune: (index: number) => void;
}

/** The tuning knob. Dragging turns it; a hidden range input carries the keyboard and screen readers. */
export function Knob({ tuned, max, label, valueText, onTune }: KnobProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; start: number } | null>(null);

  return (
    <div className={styles.knobWrap}>
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={max}
        step={1}
        value={tuned}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(event) => onTune(Number(event.target.value))}
      />
      <div
        className={styles.knob}
        style={{ '--a': `${tuned * DEGREES_PER_STATION}deg` } as CSSProperties}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, start: tuned };
          inputRef.current?.focus({ preventScroll: true });
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const moved = event.clientX - drag.current.x - (event.clientY - drag.current.y);
          onTune(drag.current.start + Math.round(moved / PIXELS_PER_STATION));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      />
    </div>
  );
}
