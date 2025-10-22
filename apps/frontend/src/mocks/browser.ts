import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function initMocks() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
