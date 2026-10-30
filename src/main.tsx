import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LANG } from './i18n';
import { registerOffline } from './lib/offline';
import { enablePinchZoom } from './lib/pinch-zoom';
import './styles.css';

document.documentElement.lang = LANG;
registerOffline();
enablePinchZoom();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
