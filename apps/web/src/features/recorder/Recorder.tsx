import { useCallback, useEffect, useRef, useState } from 'react';

import { TIMELINE } from '../../content/timeline';
import { servingReplica } from '../plant/plant';
import { usePlantState } from '../plant/plantContext';
import { buildTrace, INK_START, penX, type Trace } from './trace';
import styles from './Recorder.module.css';

/** Where the pen rests, as a share of the viewport height. Matches .carriage in the CSS. */
const PEN_HEAD = 0.62;
/** How far below an entry's top the pen should arrive: level with its date. */
const ENTRY_OFFSET = 12;

interface Chart {
  trace: Trace;
  lane: number;
  height: number;
}

/** The career on a strip chart. Scrolling feeds the paper and the pen rewinds through it. */
export function Recorder() {
  const { alive } = usePlantState();
  const serving = servingReplica(alive);
  const paperRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLOListElement>(null);
  const inkRef = useRef<SVGRectElement>(null);
  const penRef = useRef<SVGSVGElement>(null);
  const [chart, setChart] = useState<Chart | null>(null);

  const measure = useCallback(() => {
    const paper = paperRef.current;
    const list = entriesRef.current;
    if (!paper || !list) return;
    const holes = parseFloat(getComputedStyle(paper).getPropertyValue('--holes')) || 0;
    const lane = list.offsetLeft - holes;
    const height = paper.offsetHeight;
    const stops = [...list.children].map((item, index) => ({
      y: list.offsetTop + (item as HTMLElement).offsetTop + ENTRY_OFFSET,
      x: TIMELINE[index]?.x ?? 0,
    }));
    setChart({ trace: buildTrace(stops, height, lane), lane, height });
  }, []);

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const observer = new ResizeObserver(measure);
    observer.observe(paper);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!chart) return;
    let queued = false;
    const movePen = () => {
      queued = false;
      const paper = paperRef.current;
      if (!paper) return;
      const y = Math.max(
        0,
        Math.min(chart.height, innerHeight * PEN_HEAD - paper.getBoundingClientRect().top),
      );
      inkRef.current?.setAttribute('height', String(Math.max(0, y - INK_START)));
      if (penRef.current) {
        penRef.current.style.transform = `translateX(${penX(chart.trace.xs, y)}px)`;
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(movePen);
    };
    movePen();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, [chart]);

  return (
    <section className={styles.recorder} aria-labelledby="chart-title">
      <div className={styles.recorderHead}>
        <h2 id="chart-title">Thirteen years on one roll of paper</h2>
        <p>
          Today is at the top. Keep scrolling and the pen rewinds to high school. Left is close to
          the hardware, right is close to the model. I drew the swing by hand, so it&apos;s an
          opinion and not a measurement.
        </p>
      </div>
      <div className={styles.roller} />
      <div ref={paperRef} className={styles.paper}>
        <div className={styles.carriage} aria-hidden="true">
          <div className={styles.rail} style={chart ? { width: chart.lane } : undefined} />
          <svg ref={penRef} className={styles.pen} viewBox="0 0 30 34">
            <path d="M9 0h12v14l-4 4-2 15-2-15-4-4z" fill="#2c2a26" />
            <path d="M12 2h2v11h-2z" fill="#8c8a7c" />
            <path d="M15 26v8" stroke="#B3261E" strokeWidth="1.6" />
          </svg>
        </div>
        <div
          className={styles.axis}
          aria-hidden="true"
          style={chart ? { width: chart.lane } : undefined}
        >
          <span className="hand">
            <span className={styles.axisThe}>the </span>metal
          </span>
          <span className="hand">
            <span className={styles.axisThe}>the </span>model
          </span>
        </div>
        {chart && (
          <svg
            className={styles.trace}
            width={chart.lane}
            height={chart.height}
            viewBox={`0 0 ${chart.lane} ${chart.height}`}
            aria-hidden="true"
          >
            <defs>
              <clipPath id="written">
                <rect ref={inkRef} x={-10} y={INK_START} width={chart.lane + 20} height={0} />
              </clipPath>
            </defs>
            <g clipPath="url(#written)">
              <path
                d={chart.trace.d}
                fill="none"
                stroke="#B3261E"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {chart.trace.dots.map(({ x, y }) => (
                <g key={y}>
                  <circle cx={x} cy={y} r="3.2" fill="#B3261E" />
                  <path
                    d={`M${x} ${y}H${chart.lane}`}
                    stroke="#B3261E"
                    strokeWidth="1"
                    strokeDasharray="1 4"
                  />
                </g>
              ))}
            </g>
          </svg>
        )}
        <div className={styles.stamp}>Served by {serving ? `G${serving}` : 'nobody'}</div>

        <ol ref={entriesRef} className={styles.entries}>
          {TIMELINE.map(({ when, title, body }) => (
            <li key={title}>
              <time>{when}</time>
              <h3>{title}</h3>
              {body.map((block) =>
                block.kind === 'note' ? (
                  <span key={block.text} className="hand">
                    {block.text}
                  </span>
                ) : (
                  <p key={block.text}>{block.text}</p>
                ),
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className={`${styles.roller} ${styles.low}`} />
    </section>
  );
}
