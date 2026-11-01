import { useMemo, useRef, useState } from 'react';

import { MODELS } from '../../content/models';
import { usePlantServices } from '../plant/plantContext';
import { BugTest } from './BugTest';
import { Dial } from './Dial';
import { Knob } from './Knob';
import { scoreLine, stationsFor, YOU } from './tuner';
import styles from './Tuner.module.css';

const DEFAULT_STATION = 'gpt-5.4-nano';

/** The llm-bug-bench results as a radio, and a test that gets the visitor onto it. */
export function Tuner() {
  const { plant, sound, calm } = usePlantServices();
  const [you, setYou] = useState(plant.savedScore);
  const [fresh, setFresh] = useState(false);
  const [tunedName, setTunedName] = useState(plant.savedScore === null ? DEFAULT_STATION : YOU);
  const dialWrap = useRef<HTMLDivElement>(null);

  const stations = useMemo(() => stationsFor(MODELS, you, fresh), [you, fresh]);
  const tuned = Math.max(
    0,
    stations.findIndex((station) => station.name === tunedName),
  );
  const station = stations[tuned];

  const tuneTo = (index: number) => {
    const next = stations[Math.max(0, Math.min(stations.length - 1, index))];
    if (!next || next.name === tunedName) return;
    setTunedName(next.name);
    sound.tick();
  };

  const onScore = (score: number, final: boolean) => {
    plant.saveScore(score);
    setYou(score);
    setFresh(true);
    setTunedName(YOU);
    sound.tick();
    if (final) {
      dialWrap.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    }
  };

  return (
    <section className={styles.radio} aria-labelledby="radio-title">
      <div className={styles.radioWrap}>
        <div className={styles.radioHead}>
          <h2 id="radio-title">Tune in to {MODELS.length} models hunting concurrency bugs</h2>
          <p>
            I built <a href="https://github.com/gabrieldiem/llm-bug-bench">llm-bug-bench</a> to see
            which LLMs catch concurrency bugs and distributed systems mistakes. Twelve tests in Go,
            Python and theory, scored from 1 to 20. Drag across the dial or turn the knob. The judge
            is also an OpenAI model, and OpenAI models hold the top five places, so read this with
            that in mind.
          </p>
        </div>
        <div ref={dialWrap}>
          <Dial stations={stations} tuned={tuned} onPick={tuneTo} />
        </div>
        <div className={styles.tuner}>
          <div aria-live="polite">
            <div className={styles.station} data-testid="station">
              {station?.full}
            </div>
            <div className={styles.score}>{station && scoreLine(station)}</div>
            <p className={styles.remark} data-testid="remark">
              {station?.remark}
            </p>
          </div>
          <Knob
            tuned={tuned}
            max={stations.length - 1}
            label="Tune to a model"
            valueText={station ? `${station.full}, ${station.score} out of 20` : ''}
            onTune={tuneTo}
          />
        </div>
        <BugTest onScore={onScore} />
      </div>
    </section>
  );
}
