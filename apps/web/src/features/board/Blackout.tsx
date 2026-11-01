import { useEffect, useRef } from 'react';

import { cx } from '../../components/cx';
import { formatClock } from '../plant/plant';
import { usePlantServices, usePlantState } from '../plant/plantContext';
import { NameGhost } from './NameCircuit';
import styles from './Blackout.module.css';

/** All replicas down: the lights go out and the visitor restarts the plant by hand. */
export function Blackout() {
  const { plant } = usePlantServices();
  const { dark, starting, striking, seconds } = usePlantState();
  const knifeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dark) return;
    knifeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void plant.blackStart();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dark, plant]);

  if (!dark) return null;

  return (
    <div
      className={cx(styles.blackout, striking && styles.strike)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="blackout-title"
    >
      <NameGhost />
      <div className={styles.boCopy}>
        <h2 id="blackout-title">That was the last replica</h2>
        <p>
          Everything&apos;s down. Your session is safe in the checkpoint, stopped at{' '}
          {formatClock(seconds)}. Throw the switch to start the plant from nothing.
        </p>
        <button
          ref={knifeRef}
          type="button"
          className={cx(styles.knifeBtn, starting && styles.thrown)}
          disabled={starting}
          onClick={() => void plant.blackStart()}
        >
          <svg className={styles.knife} viewBox="0 0 158 196" aria-hidden="true">
            <g fill="none" stroke="#B9F6C4" strokeWidth="3" strokeLinecap="round">
              <rect x="4" y="4" width="150" height="188" rx="5" />
              <path d="M70 34v36M88 34v36M62 70h34" />
              <circle cx="79" cy="160" r="11" />
              <circle cx="14" cy="14" r="2" />
              <circle cx="144" cy="14" r="2" />
              <circle cx="14" cy="182" r="2" />
              <circle cx="144" cy="182" r="2" />
            </g>
            <g className={styles.knifeArm} fill="none" stroke="#B9F6C4" strokeLinecap="round">
              <path d="M79 160V24" strokeWidth="6" />
              <path d="M57 24h44" strokeWidth="12" />
            </g>
          </svg>
          <span className="eng">Black start</span>
        </button>
      </div>
    </div>
  );
}
