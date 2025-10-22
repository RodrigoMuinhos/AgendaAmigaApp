import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
// Para desativar o PWA no desenvolvimento, comente esta importacao e a chamada correspondente em startApp.
import { registerSW } from 'virtual:pwa-register';
import { env } from '../core/config/env';
import './i18n';
import '../styles/tailwind.css';
import '../styles/forms.css';
import { AppProviders } from './providers';
import { router } from './router';

export async function startApp() {
  if (import.meta.env.DEV && env.apiHttpBase.length === 0) {
    const { initMocks } = await import('../mocks/browser');
    await initMocks();
  }

  if ('serviceWorker' in navigator) {
    // Comente este bloco se precisar desativar o PWA temporariamente.
    registerSW({
      immediate: true,
      onNeedRefresh() {},
      onOfflineReady() {},
    });
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root container missing. Check index.html.');
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  );
}
