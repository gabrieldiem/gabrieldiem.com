import { loadCheckpoint, type CheckpointStore } from './checkpoint';
import { Plant } from './plant';
import type { PlantServices } from './plantContext';
import { createSound } from './sound';

/** Storage can throw on access when a browser blocks it. Then the session lasts one page view. */
function openStore(): CheckpointStore {
  try {
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => void memory.set(key, value),
    };
  }
}

export function createPlantServices(): PlantServices {
  const store = openStore();
  const checkpoint = loadCheckpoint(store);
  const sound = createSound();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plant = new Plant({
    store,
    checkpoint,
    sound,
    calm,
    openChannel: () =>
      'BroadcastChannel' in window ? new BroadcastChannel('gabrieldiem-plant') : null,
    isHidden: () => document.hidden,
  });
  return { plant, sound, calm };
}
