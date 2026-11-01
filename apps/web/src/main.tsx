import '@fontsource/b612/400.css';
import '@fontsource/b612/700.css';
import '@fontsource/besley/400.css';
import '@fontsource/besley/600.css';
import '@fontsource/besley/800.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/reenie-beanie/400.css';
import './styles/tokens.css';
import './styles/base.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { createPlantServices } from './features/plant/services';
import { PlantRoot } from './features/plant/PlantRoot';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <PlantRoot services={createPlantServices()}>
      <App />
    </PlantRoot>
  </StrictMode>,
);
