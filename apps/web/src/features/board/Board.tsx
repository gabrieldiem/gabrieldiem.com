import { useEffect, useRef } from 'react';

import { Screws } from '../../components/Screws';
import { usePlantServices, usePlantState } from '../plant/plantContext';
import { Feeders } from './Feeders';
import { NameCircuit } from './NameCircuit';
import { TapeUnit } from './TapeUnit';
import styles from './Board.module.css';

const SHAKE: Keyframe[] = [
  { transform: 'translate(0, 0)' },
  { transform: 'translate(1px, 1px)' },
  { transform: 'translate(-1px, 1px)' },
  { transform: 'translate(1px, -1px)' },
  { transform: 'translate(0, 0)' },
];

/** The first screen: the name as a circuit, the breakers that feed it, and the log. */
export function Board() {
  const { calm } = usePlantServices();
  const state = usePlantState();
  const boardRef = useRef<HTMLElement>(null);
  const { trips, dark } = state;

  // A trip knocks the whole panel.
  const seenTrips = useRef(trips);
  useEffect(() => {
    if (trips > seenTrips.current && !calm) boardRef.current?.animate?.(SHAKE, 200);
    seenTrips.current = trips;
  }, [trips, calm]);

  // Coming back from the blackout, hand focus back to the board.
  const wasDark = useRef(dark);
  useEffect(() => {
    if (wasDark.current && !dark) {
      boardRef.current
        ?.querySelector<HTMLElement>('[data-first-breaker]')
        ?.focus({ preventScroll: true });
    }
    wasDark.current = dark;
  }, [dark]);

  return (
    <section ref={boardRef} className={`panel ${styles.board}`} aria-labelledby="who">
      <Screws angles={[24, 98, 141, 62]} />
      <h1 className="sr" id="who">
        Gabriel Diem
      </h1>

      <div className={styles.boardGrid}>
        <div className={styles.boardMain}>
          <NameCircuit state={state} />
          <Feeders boardRef={boardRef} />
          <div className={styles.intro}>
            <p>
              Principal Data &amp; AI Architect at Salesforce. Teaching assistant for Distributed
              Systems at the University of Buenos Aires. I build AI agents and mostly think about
              what happens when a machine dies halfway through.
            </p>
            <p>Three replicas keep my name lit. Trip a breaker.</p>
          </div>
        </div>
        <TapeUnit />
        <p className={`hand ${styles.downstairs}`}>
          the rest of the plant is downstairs
          <svg viewBox="0 0 22 34" aria-hidden="true">
            <path
              d="M9 1c3 8-1 15 2 30M3 23c3 3 6 6 8 9 2-4 5-7 9-10"
              fill="none"
              stroke="#1E3F9A"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </p>
      </div>
    </section>
  );
}
