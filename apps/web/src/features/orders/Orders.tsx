import { Screws } from '../../components/Screws';
import { STANDING_ORDERS } from '../../content/orders';
import styles from './Orders.module.css';

/** How Gabriel likes AI: typed standing orders taped to the panel. */
export function Orders() {
  return (
    <section className={`panel ${styles.orders}`} aria-labelledby="orders-title">
      <Screws angles={[75, 12, 120, 44]} />
      <div className={styles.ordersWrap}>
        <div className={styles.ordersLead}>
          <h2 id="orders-title">I like AI the way I like any machine</h2>
          <p>
            I want to open it up, watch it run, break it on purpose and see if it comes back. Demos
            don&apos;t tell me much. A long-running session on its third replica does.
          </p>
          <span className="hand">
            I grade student code too, and I research how to spot when a model wrote it. Yes, I see
            the irony.
          </span>
        </div>
        <div className={styles.sheet}>
          <h3>Standing orders for anything with a model in it</h3>
          <ol>
            {STANDING_ORDERS.map(({ order, detail }) => (
              <li key={order}>
                <div>
                  <strong>{order}</strong>
                  <span>{detail}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.sign}>G. Diem</p>
        </div>
      </div>
    </section>
  );
}
