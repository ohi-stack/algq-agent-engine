import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {bootstrapAREPlatformSync} from './services/platformSyncCoordinator';

async function mount() {
  try {
    await bootstrapAREPlatformSync();
  } catch (error) {
    console.warn('[ARE Agent Engine] Platform synchronization bootstrap failed; continuing with local fallback.', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void mount();
