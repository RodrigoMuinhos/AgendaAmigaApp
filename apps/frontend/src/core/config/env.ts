// src/core/config/env.ts
/**
 * Configuração de ambiente do frontend (Vite)
 * Lê as variáveis definidas no .env.local (dev) e .env.production (build)
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

if (!rawApiUrl && !import.meta.env.DEV) {
  console.warn(
    '[env] ⚠️ VITE_API_URL não definida. As requisições podem falhar em produção.'
  );
}

export const env = {
  apiHttpBase,
  apiWsPath,
  logoutRedirect,
};

console.log('[env] Frontend conectado à API base:', apiHttpBase);
