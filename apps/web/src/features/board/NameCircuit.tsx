import { useMediaQuery } from '../../components/useMediaQuery';
import { cx } from '../../components/cx';
import { REPLICAS, tieOwner, type PlantState } from '../plant/plant';
import {
  buildCircuit,
  LAYOUTS,
  type Circuit,
  type CircuitMark,
  type CircuitPath,
} from './nameCircuit';
import styles from './NameCircuit.module.css';

const WIDE = buildCircuit(LAYOUTS.wide);
const NARROW = buildCircuit(LAYOUTS.narrow);

function casingPaths(circuit: Circuit): CircuitPath[] {
  return [
    ...REPLICAS.flatMap((section) => circuit.sections[section].paths),
    ...circuit.stubs.map(({ d }) => ({ d, big: false })),
    ...circuit.ties.map(({ d }) => ({ d, big: false })),
  ];
}

function Mark({ mark }: { mark: CircuitMark }) {
  if (mark.kind === 's') {
    const r = 0.52;
    return (
      <>
        <rect className={styles.mark} x={mark.x - r} y={mark.y - r} width={r * 2} height={r * 2} />
        <rect
          className={styles.pip}
          x={mark.x - r * 0.45}
          y={mark.y - r * 0.45}
          width={r * 0.9}
          height={r * 0.9}
        />
      </>
    );
  }
  return (
    <>
      <circle className={styles.mark} cx={mark.x} cy={mark.y} r={0.42} />
      <circle className={styles.pip} cx={mark.x} cy={mark.y} r={0.2} />
    </>
  );
}

/** The visitor's headline: the name as a live circuit, coloured by the replica feeding each part. */
export function NameCircuit({ state }: { state: Pick<PlantState, 'alive' | 'owners'> }) {
  const wide = useMediaQuery('(min-width: 1180px)');
  const circuit = wide ? WIDE : NARROW;
  const { alive, owners } = state;

  return (
    <svg
      className={styles.name}
      viewBox={circuit.viewBox}
      role="img"
      aria-label="The name Gabriel Diem, drawn as a live electrical circuit fed by three replicas"
    >
      <g>
        {casingPaths(circuit).map(({ d, transform, big }, index) => (
          <path
            key={index}
            className={cx(styles.casing, big && styles.big)}
            d={d}
            transform={transform}
          />
        ))}
      </g>
      {REPLICAS.map((section) => (
        <g key={section} data-section={section} data-owner={owners[section]}>
          {circuit.sections[section].paths.map(({ d, transform, big }, index) => (
            <g key={index}>
              <path className={cx(styles.inner, big && styles.big)} d={d} transform={transform} />
              <path className={cx(styles.flow, big && styles.big)} d={d} transform={transform} />
            </g>
          ))}
          {circuit.sections[section].marks.map((mark, index) => (
            <Mark key={index} mark={mark} />
          ))}
        </g>
      ))}
      {circuit.ties.map(({ a, b, d, x, y }) => (
        <g key={d} data-tie={`${a}-${b}`} data-owner={tieOwner(a, b, owners, alive)}>
          <path className={styles.inner} d={d} />
          <path className={styles.flow} d={d} />
          <rect className={styles.mark} x={x - 0.55} y={y - 0.55} width={1.1} height={1.1} />
          <rect className={styles.pip} x={x - 0.25} y={y - 0.25} width={0.5} height={0.5} />
        </g>
      ))}
      {circuit.stubs.map(({ replica, d }) => (
        <g key={replica} data-owner={alive[replica] ? replica : 0}>
          <path className={styles.inner} d={d} />
          <path className={styles.flow} d={d} />
        </g>
      ))}
    </svg>
  );
}

/** What's left of the name in the dark: glow-in-the-dark paint, no current. */
export function NameGhost() {
  const marks = REPLICAS.flatMap((section) => WIDE.sections[section].marks);
  return (
    <div className={styles.ghostWrap} aria-hidden="true">
      <svg className={styles.ghostSvg} viewBox={WIDE.viewBox}>
        {casingPaths(WIDE).map(({ d, transform }, index) => (
          <path key={index} className={styles.ghostCasing} d={d} transform={transform} />
        ))}
        {marks.map(({ kind, x, y }, index) =>
          kind === 's' ? (
            <rect
              key={index}
              className={styles.ghostMark}
              x={x - 0.52}
              y={y - 0.52}
              width={1.04}
              height={1.04}
            />
          ) : (
            <circle key={index} className={styles.ghostMark} cx={x} cy={y} r={0.42} />
          ),
        )}
        {WIDE.ties.map(({ x, y, d }) => (
          <rect
            key={d}
            className={styles.ghostMark}
            x={x - 0.55}
            y={y - 0.55}
            width={1.1}
            height={1.1}
          />
        ))}
      </svg>
    </div>
  );
}
