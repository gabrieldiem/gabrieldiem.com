import { formatClock } from '../plant/plant';
import { usePlantServices, usePlantState } from '../plant/plantContext';
import styles from './Board.module.css';

/** The plant's readouts and teleprinter log, with the sound switch on the printer. */
export function TapeUnit() {
  const { plant } = usePlantServices();
  const { log, seconds, trips, soundOn } = usePlantState();

  return (
    <aside className={styles.tapeUnit} aria-label="Plant log">
      <div className={styles.readouts}>
        <div>
          <span className="eng">On site</span>
          <span className={styles.drum} data-testid="clock">
            {formatClock(seconds)}
          </span>
        </div>
        <div>
          <span className="eng">Trips</span>
          <span className={styles.drum} data-testid="trips">
            {String(trips).padStart(4, '0')}
          </span>
        </div>
      </div>
      <span className={`hand ${styles.tapeNote}`}>try it with two windows</span>
      <div className={styles.tapeHousing}>
        <div className={styles.tape} role="log" aria-live="polite">
          {log.map(({ id, time, text, bad }) => (
            <p key={id} className={bad ? styles.bad : undefined}>
              <time>{time}</time>
              {text}
            </p>
          ))}
        </div>
        <div className={styles.tapeMouth}>
          <span className="eng">Log</span>
          <button
            type="button"
            className={`eng ${styles.soundBtn}`}
            aria-pressed={soundOn}
            onClick={() => plant.setSound(!soundOn)}
          >
            <i />
            Sound
          </button>
        </div>
      </div>
    </aside>
  );
}
