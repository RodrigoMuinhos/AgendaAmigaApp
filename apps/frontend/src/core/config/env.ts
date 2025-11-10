const rawApiUrl =
  (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_HTTP_BASE ?? '').trim();
const apiHttpBase =
  rawApiUrl.replace(/\/$/, '') || (import.meta.env.DEV ? '/api' : '');
const apiWsPath = (import.meta.env.VITE_API_WS_PATH ?? '').trim() || '/socket.io';
const logoutRedirect =
  (import.meta.env.VITE_LOGOUT_URL ?? '/').trim() || '/';

if (!rawApiUrl && !import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is not set. Requests may fallback to relative paths.');
}

export const env = {
  apiHttpBase,
  apiWsPath,
  logoutRedirect,
};
