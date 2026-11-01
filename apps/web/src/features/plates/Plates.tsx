import type { CSSProperties } from 'react';

import { cx } from '../../components/cx';
import { Screws } from '../../components/Screws';
import { PLATES } from '../../content/plates';
import styles from './Plates.module.css';

/** Other projects, as engraved plates on the wall. Black is personal, blue is coursework. */
export function Plates() {
  return (
    <section className={`panel ${styles.plates}`} aria-labelledby="plates-title">
      <Screws angles={[150, 33, 88, 5]} />
      <div className={styles.platesWrap}>
        <div className={styles.platesLead}>
          <h2 id="plates-title">Other equipment on site</h2>
          <span className="hand">black plates are mine, blue ones are for class</span>
        </div>
        <ul className={styles.plateWall}>
          {PLATES.map(({ name, description, href, school, width }) => (
            <li key={name} style={{ '--w': `${width}px` } as CSSProperties}>
              <a className={cx(styles.lam, school && styles.school)} href={href}>
                <b>{name}</b>
                <span>{description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
