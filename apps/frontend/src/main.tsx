import { startApp } from './app/main';

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
    if (typeof caches !== 'undefined') {
      caches.keys?.().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
  });
}

startApp().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start Agenda Amiga', error);
});
