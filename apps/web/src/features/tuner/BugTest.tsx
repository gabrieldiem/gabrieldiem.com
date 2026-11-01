import { useState } from 'react';

import { cx } from '../../components/cx';
import { CODE, FIXES, LINE_SCORES, LINE_TEXT, type LineVerdict } from './bugTest';
import styles from './Tuner.module.css';

const LINE_CLASS: Record<LineVerdict, string | undefined> = {
  hit: styles.hit,
  near: styles.near,
  miss: styles.miss,
};

interface Result {
  score: number;
  text: string;
  /** The right line was found, so the follow-up question is open. */
  askFix: boolean;
}

/** One real test from the bench. The visitor's score puts them on the dial. */
export function BugTest({ onScore }: { onScore: (score: number, final: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  // Once the right line is found, the card is done.
  const locked = picked !== null && CODE[picked]?.verdict === 'hit';

  return (
    <div className={styles.test}>
      <div>
        <h3>Your turn. Get on the dial.</h3>
        <p className={styles.testIntro}>
          This is one of the twelve, shortened. Two transfers run at once and sometimes the program
          hangs forever. Pick the line where it gets stuck.
        </p>
        <div className={styles.verdict} aria-live="polite">
          {result && (
            <>
              <p className={styles.big}>{result.score} out of 20</p>
              <p>{result.text}</p>
              {result.askFix && (
                <div className={styles.fixes}>
                  {FIXES.map(({ label, score, text }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setResult({ score, text, askFix: false });
                        onScore(score, true);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.card}>
        {CODE.map(({ text, verdict }, index) =>
          verdict ? (
            <button
              key={index}
              type="button"
              className={cx(picked === index && LINE_CLASS[verdict])}
              disabled={locked}
              aria-label={`Line: ${text.trim()}`}
              onClick={() => {
                setPicked(index);
                setResult({
                  score: LINE_SCORES[verdict],
                  text: LINE_TEXT[verdict],
                  askFix: verdict === 'hit',
                });
                onScore(LINE_SCORES[verdict], false);
              }}
            >
              {text}
            </button>
          ) : (
            <code key={index}> </code>
          ),
        )}
      </div>
    </div>
  );
}
