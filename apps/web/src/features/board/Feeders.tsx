import { useEffect, useRef, type RefObject } from 'react';

import { cx } from '../../components/cx';
import { usePlantServices, usePlantState } from '../plant/plantContext';
import { REPLICAS, type PlantState } from '../plant/plant';
import { Gauge } from './Gauge';
import { loadTarget, needleTransform, stepNeedle, type Needle } from './needle';
import styles from './Board.module.css';

function useNeedles(
  alive: PlantState['alive'],
  boardRef: RefObject<HTMLElement | null>,
  needlesRef: RefObject<(SVGGElement | null)[]>,
  calm: boolean,
) {
  const aliveRef = useRef(alive);
  useEffect(() => {
    aliveRef.current = alive;
  }, [alive]);

  useEffect(() => {
    const needles: Needle[] = REPLICAS.map(() => ({ position: 0, velocity: 0 }));
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    if (boardRef.current) observer.observe(boardRef.current);

    let frame = requestAnimationFrame(function loop(time) {
      if (visible) {
        const current = aliveRef.current;
        const count = REPLICAS.filter((replica) => current[replica]).length;
        REPLICAS.forEach((replica, index) => {
          const wobble = calm
            ? 0
            : Math.sin(time / (700 + index * 170) + index * 2) * 1.6 +
              Math.sin(time / 190 + index) * 0.5;
          const target = current[replica] ? loadTarget(count, wobble) : 0;
          const needle = needles[index] ?? { position: 0, velocity: 0 };
          const next = calm ? { position: target, velocity: 0 } : stepNeedle(needle, target);
          needles[index] = next;
          needlesRef.current[index]?.setAttribute('transform', needleTransform(next.position));
        });
      }
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [boardRef, needlesRef, calm]);
}

/** The three replica cabinets: name plate, load meter and breaker. */
export function Feeders({ boardRef }: { boardRef: RefObject<HTMLElement | null> }) {
  const { plant, calm } = usePlantServices();
  const { alive } = usePlantState();
  const needlesRef = useRef<(SVGGElement | null)[]>([]);
  useNeedles(alive, boardRef, needlesRef, calm);

  return (
    <div className={styles.feeders}>
      {REPLICAS.map((replica, index) => (
        <div
          key={replica}
          className={cx(styles.feeder, alive[replica] && styles.on)}
          data-g={replica}
        >
          <div className={styles.tagplate}>
            <span className={styles.lamp} />
            <span className="eng">
              <span className={styles.wideOnly}>Replica </span>G{replica}
            </span>
          </div>
          <div className={styles.controls}>
            <div className={styles.gauge}>
              <Gauge
                needleRef={(element) => {
                  needlesRef.current[index] = element;
                }}
              />
            </div>
            <button
              type="button"
              className={styles.breaker}
              role="switch"
              aria-checked={alive[replica]}
              aria-label={`Replica G${replica} breaker`}
              data-first-breaker={index === 0 ? '' : undefined}
              onClick={() => plant.toggle(replica)}
            >
              <span className={styles.onL} aria-hidden="true">
                ON
              </span>
              <span className={styles.slot} aria-hidden="true">
                <span className={styles.lever} />
              </span>
              <span className={styles.offL} aria-hidden="true">
                OFF
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
