import { useEffect, type ReactNode } from 'react';

import { PlantContext, type PlantServices } from './plantContext';

/** Provides the plant to the page and keeps its clock and window links running while mounted. */
export function PlantRoot({
  services,
  children,
}: {
  services: PlantServices;
  children: ReactNode;
}) {
  useEffect(() => services.plant.start(), [services.plant]);
  return <PlantContext value={services}>{children}</PlantContext>;
}
