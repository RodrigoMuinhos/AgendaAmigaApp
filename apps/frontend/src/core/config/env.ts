// src/core/config/env.ts
/**
 * Frontend environment configuration (Next.js)
 * Reads the environment variables shipped via .env.* files and NEXT_PUBLIC_ prefixed keys.
 */

const rawApiUrl =
  (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_HTTP_BASE ?? '').trim();

const isDev = process.env.NODE_ENV !== 'production';

const apiHttpBase =
  rawApiUrl.replace(/\/$/, '') || (isDev ? 'http://localhost:3000' : 'https://agendaamiga-api.onrender.com');

const apiWsPath = (process.env.NEXT_PUBLIC_API_WS_PATH ?? '').trim() || '/socket.io';

const logoutRedirect = (process.env.NEXT_PUBLIC_LOGOUT_URL ?? '/login').trim() || '/login';

const authDisabledRaw = (process.env.NEXT_PUBLIC_AUTH_DISABLED ?? '').trim().toLowerCase();
const authDisabled = authDisabledRaw === 'true' || authDisabledRaw === '1';

if (!rawApiUrl && !isDev) {
  console.warn('[env] NEXT_PUBLIC_API_URL não definida. As requisições podem falhar em produção.');
}

export const env = {
  apiHttpBase,
  apiWsPath,
  logoutRedirect,
  authDisabled,
};

console.log('[env] Frontend conectado à API base:', apiHttpBase);
