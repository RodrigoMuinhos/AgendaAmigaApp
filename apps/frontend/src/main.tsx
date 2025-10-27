import { startApp } from './app/main';

startApp().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start Agenda Amiga', error);
});
