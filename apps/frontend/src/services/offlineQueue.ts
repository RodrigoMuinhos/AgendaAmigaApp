const pendingConfirmations: { logId: string; createdAt: string }[] = [];

export function enqueueDoseConfirmation(logId: string) {
  pendingConfirmations.push({ logId, createdAt: new Date().toISOString() });
  console.debug('[offline-queue] dose enfileirada', { logId });
}

export async function flushPendingConfirmations(handler: (logId: string) => Promise<void>) {
  while (pendingConfirmations.length > 0) {
    const next = pendingConfirmations.shift();
    if (!next) {
      continue;
    }
    try {
      await handler(next.logId);
      console.debug('[offline-queue] dose sincronizada', { logId: next.logId });
    } catch (error) {
      console.warn('[offline-queue] falha ao sincronizar, retornando à fila', error);
      pendingConfirmations.unshift(next);
      break;
    }
  }
}

export function getPendingConfirmations() {
  return [...pendingConfirmations];
}

