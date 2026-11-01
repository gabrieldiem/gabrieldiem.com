import { createContext, use, useSyncExternalStore } from 'react';
import type { Plant, PlantState } from './plant';
import type { Sound } from './sound';

export interface PlantServices {
  plant: Plant;
  sound: Sound;
  /** Prefers-reduced-motion, read once at boot. */
  calm: boolean;
}

export const PlantContext = createContext<PlantServices | null>(null);

export function usePlantServices(): PlantServices {
  const services = use(PlantContext);
  if (!services) throw new Error('usePlantServices needs a PlantContext provider');
  return services;
}

export function usePlantState(): PlantState {
  const { plant } = usePlantServices();
  return useSyncExternalStore(plant.subscribe, plant.getState);
}
