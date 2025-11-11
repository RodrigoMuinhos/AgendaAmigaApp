// src/core/config/env.ts
/**
 * Configura��ǜo de ambiente do frontend (Vite)
 * LǦ as variǭveis definidas no .env.local (dev) e .env.production (build)
 */

const rawApiUrl =
  (import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_API_HTTP_BASE ??
    '').trim();

const apiHttpBase =
  rawApiUrl.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://agendaamiga-api.onrender.com');

const apiWsPath =
  (import.meta.env.VITE_API_WS_PATH ?? '').trim() || '/socket.io';

const logoutRedirect =
  (import.meta.env.VITE_LOGOUT_URL ?? '/login').trim() || '/login';

const authDisabledRaw = String(import.meta.env.VITE_AUTH_DISABLED ?? 'true')
  .trim()
  .toLowerCase();
const authDisabled = authDisabledRaw === 'true' || authDisabledRaw === '1';

if (!rawApiUrl && !import.meta.env.DEV) {
  console.warn(
    '[env] �s���? VITE_API_URL nǜo definida. As requisi����es podem falhar em produ��ǜo.'
  );
}

export const env = {
  apiHttpBase,
  apiWsPath,
  logoutRedirect,
  authDisabled,
};

console.log('[env] Frontend conectado �� API base:', apiHttpBase);
