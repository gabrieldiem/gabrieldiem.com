import { saveCheckpoint, type Checkpoint, type CheckpointStore } from './checkpoint';
import type { Sound } from './sound';

export type Replica = 1 | 2 | 3;
/** A section is the part of the name a replica feeds. 0 means nobody is feeding it. */
export type Section = Replica;
export type Owner = Replica | 0;

export const REPLICAS: readonly Replica[] = [1, 2, 3];

export interface LogLine {
  id: number;
  time: string;
  text: string;
  bad: boolean;
}

export interface PlantState {
  alive: Record<Replica, boolean>;
  owners: Record<Section, Owner>;
  dark: boolean;
  /** The knife switch has been thrown and the plant is coming back. */
  starting: boolean;
  /** The overhead tubes are striking: the blackout screen thins for a moment. */
  striking: boolean;
  log: LogLine[];
  seconds: number;
  trips: number;
  soundOn: boolean;
}

/** The replica that takes over a section, in order of preference. Neighbours first. */
const PREFERENCE: Record<Section, readonly Replica[]> = {
  1: [1, 2, 3],
  2: [2, 1, 3],
  3: [3, 2, 1],
};

const MAX_LOG_LINES = 40;
const PEER_TIMEOUT_MS = 4000;

export function preferredOwner(section: Section, alive: PlantState['alive']): Owner {
  return PREFERENCE[section].find((replica) => alive[replica]) ?? 0;
}

/** The first live replica. It is the one a visitor's session is on. */
export function servingReplica(alive: PlantState['alive']): Owner {
  return REPLICAS.find((replica) => alive[replica]) ?? 0;
}

/** A tie carries current only while one neighbour is feeding the other's section. */
export function tieOwner(
  a: Section,
  b: Section,
  owners: PlantState['owners'],
  alive: PlantState['alive'],
): Owner {
  const same = owners[a] !== 0 && owners[a] === owners[b];
  return same && !(alive[a] && alive[b]) ? owners[a] : 0;
}

export function formatClock(seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

type Message =
  | { t: 'hello' | 'beat' | 'bye' | 'dark' | 'start'; from: string }
  | { t: 'here'; from: string; alive: PlantState['alive']; dark: boolean }
  | { t: 'set'; from: string; replica: Replica; on: boolean };

/** What the plant needs from BroadcastChannel. */
export interface PlantChannel {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent) => void) | null;
  close(): void;
}

export interface PlantDeps {
  store: CheckpointStore;
  checkpoint: Checkpoint;
  sound: Sound;
  /** Prefers-reduced-motion: failovers still run, just without the theatre. */
  calm: boolean;
  openChannel?: () => PlantChannel | null;
  isHidden?: () => boolean;
}

/**
 * The simulated cluster behind the page: three replicas, a shared session checkpoint, and real
 * browser windows that can join and leave. React reads it through subscribe() and getState().
 */
export class Plant {
  private state: PlantState;
  private readonly listeners = new Set<() => void>();
  private readonly checkpoint: Checkpoint;
  private readonly me = Math.random().toString(36).slice(2, 7);
  private readonly peers = new Map<string, number>();
  private channel: PlantChannel | null = null;
  private nextLine = 0;
  private assignTimer: ReturnType<typeof setTimeout> | undefined;
  private blackTimer: ReturnType<typeof setTimeout> | undefined;
  private stopFns: (() => void)[] = [];

  constructor(private readonly deps: PlantDeps) {
    this.checkpoint = deps.checkpoint;
    deps.sound.setEnabled(this.checkpoint.sound);
    this.state = {
      alive: { 1: true, 2: true, 3: true },
      owners: { 1: 1, 2: 2, 3: 3 },
      dark: false,
      starting: false,
      striking: false,
      log: [],
      seconds: this.checkpoint.seconds,
      trips: this.checkpoint.trips,
      soundOn: this.checkpoint.sound,
    };
    if (this.checkpoint.visits > 1) {
      this.log(
        `Session ${this.checkpoint.id} restored from checkpoint. Visit ${this.checkpoint.visits}, ${this.checkpoint.trips} trips so far.`,
      );
    } else {
      this.log(`Session ${this.checkpoint.id} opened on G1.`);
      this.log('Checkpoints going to localStorage.');
    }
    this.log('G1, G2, G3 on the bus. Load shared.');
    this.save();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): PlantState => this.state;

  private set(patch: Partial<PlantState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private log(text: string, bad = false) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const line: LogLine = {
      id: this.nextLine++,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      text,
      bad,
    };
    this.set({ log: [...this.state.log, line].slice(-MAX_LOG_LINES) });
  }

  private save() {
    this.checkpoint.seconds = this.state.seconds;
    this.checkpoint.trips = this.state.trips;
    this.checkpoint.sound = this.state.soundOn;
    saveCheckpoint(this.deps.store, this.checkpoint);
  }

  private post(message: { t: Message['t'] } & Record<string, unknown>) {
    this.channel?.postMessage({ ...message, from: this.me });
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) =>
      setTimeout(resolve, this.deps.calm ? Math.min(ms, 40) : ms),
    );
  }

  /** Hand every section to the replica that should be feeding it now. */
  private assign(announce: boolean) {
    const owners = { ...this.state.owners };
    for (const section of REPLICAS) {
      const next = preferredOwner(section, this.state.alive);
      if (next !== 0 && owners[section] !== next) {
        owners[section] = next;
        if (announce) {
          this.log(
            next === section
              ? `G${section} checkpoint read. Taking its letters back.`
              : `G${next} read the checkpoint, took over G${section}'s letters. Name still lit.`,
          );
        }
      }
    }
    this.set({ owners });
    this.deps.sound.tick();
  }

  toggle = (replica: Replica) => {
    this.setBreaker(replica, !this.state.alive[replica]);
  };

  setBreaker(replica: Replica, on: boolean, remote = false) {
    const { alive, dark } = this.state;
    if (alive[replica] === on || dark) return;
    const nextAlive = { ...alive, [replica]: on };
    this.deps.sound.clunk();

    if (!on) {
      const owners = { ...this.state.owners };
      for (const section of REPLICAS) if (owners[section] === replica) owners[section] = 0;
      this.set({ alive: nextAlive, owners, trips: this.state.trips + 1 });
      this.save();
      this.log(`G${replica} breaker tripped.`, true);
      clearTimeout(this.assignTimer);
      if (!REPLICAS.some((r) => nextAlive[r])) {
        this.log('No replicas left. Plant is dark.', true);
        this.deps.sound.hum(1, 0.05, 1.3);
        this.blackTimer = setTimeout(() => this.goDark(), this.deps.calm ? 100 : 620);
      } else {
        setTimeout(() => this.log(`No heartbeat from G${replica}.`, true), 500);
        this.assignTimer = setTimeout(() => this.assign(true), this.deps.calm ? 300 : 1150);
      }
    } else {
      clearTimeout(this.blackTimer);
      this.set({ alive: nextAlive });
      this.log(`G${replica} back on the bus.`);
      clearTimeout(this.assignTimer);
      this.assignTimer = setTimeout(() => this.assign(true), this.deps.calm ? 100 : 520);
    }
    if (!remote) this.post({ t: 'set', replica, on });
  }

  private goDark(remote = false) {
    if (this.state.dark) return;
    this.set({ dark: true, starting: false });
    this.save();
    if (!remote) this.post({ t: 'dark' });
  }

  /** Bring the plant back from nothing, with the session intact. */
  blackStart = async (remote = false) => {
    if (!this.state.dark || this.state.starting) return;
    this.set({ starting: true });
    if (!remote) this.post({ t: 'start' });
    const { sound } = this.deps;
    await this.wait(320);
    sound.clunk(1.3);
    sound.hum(0.05, 1, 1.7);
    // Three strikes of the overhead tubes, slow enough to stay under three flashes a second.
    for (let strike = 0; strike < 3; strike++) {
      await this.wait(380);
      this.set({ striking: true });
      sound.clunk(0.25);
      await this.wait(90);
      this.set({ striking: false });
    }
    await this.wait(280);
    this.set({ dark: false, starting: false });
    for (const replica of REPLICAS) {
      this.set({
        alive: { ...this.state.alive, [replica]: true },
        owners: { ...this.state.owners, [replica]: replica },
      });
      sound.clunk(0.9);
      await this.wait(320);
    }
    this.log(
      `Black start done. Session ${this.checkpoint.id} restored from checkpoint at ${formatClock(this.state.seconds)}. Nothing lost.`,
    );
  };

  /** The visitor's bug test score, from this session or a past one. */
  get savedScore(): number | null {
    return this.checkpoint.you;
  }

  saveScore = (score: number) => {
    this.checkpoint.you = score;
    this.save();
  };

  setSound = (on: boolean) => {
    this.deps.sound.setEnabled(on);
    this.set({ soundOn: on });
    this.save();
    if (on) this.deps.sound.clunk(0.5);
  };

  /** Start the clock and join other windows. Returns the matching stop. */
  start = (): (() => void) => {
    this.stop();
    const clock = setInterval(() => {
      if (this.state.dark || this.deps.isHidden?.()) return;
      this.set({ seconds: this.state.seconds + 1 });
      if (this.state.seconds % 5 === 0) this.save();
    }, 1000);
    const onHide = () => {
      this.save();
      this.post({ t: 'bye' });
    };
    addEventListener('pagehide', onHide);
    this.stopFns = [() => clearInterval(clock), () => removeEventListener('pagehide', onHide)];

    this.channel = this.deps.openChannel?.() ?? null;
    if (this.channel) {
      this.channel.onmessage = ({ data }) => this.onMessage(data as Message);
      this.post({ t: 'hello' });
      const beat = setInterval(() => {
        this.post({ t: 'beat' });
        const now = Date.now();
        this.peers.forEach((seen, id) => {
          if (now - seen > PEER_TIMEOUT_MS) {
            this.peers.delete(id);
            this.log('Lost the heartbeat from another window.', true);
          }
        });
      }, 1000);
      this.stopFns.push(
        () => clearInterval(beat),
        () => {
          this.channel?.close();
          this.channel = null;
        },
      );
    }
    return this.stop;
  };

  stop = () => {
    this.stopFns.forEach((fn) => fn());
    this.stopFns = [];
  };

  private checkIn(id: string) {
    if (!this.peers.has(id)) this.log('Another window joined. Breakers are shared now, try one.');
    this.peers.set(id, Date.now());
  }

  private onMessage(message: Message) {
    // A restarted channel in this same window can still hear what it posted before.
    if (message.from === this.me) return;
    switch (message.t) {
      case 'hello':
        this.checkIn(message.from);
        this.post({ t: 'here', alive: this.state.alive, dark: this.state.dark });
        break;
      case 'here':
        this.checkIn(message.from);
        if (message.dark) {
          this.set({ alive: message.alive });
          this.goDark(true);
        } else if (
          !this.state.dark &&
          REPLICAS.some((r) => message.alive[r] !== this.state.alive[r])
        ) {
          this.set({ alive: message.alive });
          this.assign(false);
        }
        break;
      case 'beat':
        this.checkIn(message.from);
        break;
      case 'bye':
        if (this.peers.delete(message.from)) {
          this.log('A window left. That one was a real failure.', true);
        }
        break;
      case 'set':
        this.setBreaker(message.replica, message.on, true);
        break;
      case 'dark':
        this.goDark(true);
        break;
      case 'start':
        void this.blackStart(true);
        break;
    }
  }
}
