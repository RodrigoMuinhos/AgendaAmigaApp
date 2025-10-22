/**
 * Utilitario para remover service workers e caches persistidos durante o desenvolvimento.
 * Nao e invocado automaticamente; chame manualmente se precisar reiniciar o estado da PWA.
 */
export async function cleanupDevServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (error) {
    console.warn("[PWA] Nao foi possivel desregistrar os service workers", error);
  }

  if (!("caches" in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch (error) {
    console.warn("[PWA] Nao foi possivel limpar os caches locais", error);
  }
}
