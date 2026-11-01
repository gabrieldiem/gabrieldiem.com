import { CONTACT_LINKS } from '../../content/links';
import styles from './Phone.module.css';

export function Phone() {
  return (
    <footer className={styles.phone}>
      <div className={styles.phoneWrap}>
        <h2>Call the control room</h2>
        <ul className={styles.lines}>
          {CONTACT_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <p className={styles.small}>
          The replicas on this page are a simulation running in your browser. The checkpoint is
          real, it sits in localStorage. Reload and your session comes back. Buenos Aires runs at 50
          Hz, and so does the hum.
        </p>
      </div>
    </footer>
  );
}
