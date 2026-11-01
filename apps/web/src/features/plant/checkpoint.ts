/** The session state that survives a crash. On this site, "blob storage" is localStorage. */
export interface Checkpoint {
  id: string;
  visits: number;
  seconds: number;
  trips: number;
  sound: boolean;
  /** The visitor's score on the bug test, once they have one. */
  you: number | null;
}

export type CheckpointStore = Pick<Storage, 'getItem' | 'setItem'>;

const KEY = 'usina.checkpoint.v1';

function newSessionId(): string {
  return Math.random().toString(16).slice(2, 6).toUpperCase();
}

/** Read the checkpoint, or start a new session, and count this visit. */
export function loadCheckpoint(store: CheckpointStore): Checkpoint {
  let saved: Partial<Checkpoint> = {};
  try {
    saved = (JSON.parse(store.getItem(KEY) ?? '{}') as Partial<Checkpoint> | null) ?? {};
  } catch {
    // Corrupt or blocked storage is a fresh session, not an error.
  }
  return {
    id: saved.id ?? newSessionId(),
    visits: (saved.visits ?? 0) + 1,
    seconds: saved.seconds ?? 0,
    trips: saved.trips ?? 0,
    sound: saved.sound ?? true,
    you: typeof saved.you === 'number' ? saved.you : null,
  };
}

export function saveCheckpoint(store: CheckpointStore, checkpoint: Checkpoint): void {
  try {
    store.setItem(KEY, JSON.stringify(checkpoint));
  } catch {
    // Private mode or a full disk: the page keeps working, it just won't remember.
  }
}
