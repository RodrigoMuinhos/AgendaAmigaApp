const apiHttpBase = (import.meta.env.VITE_API_HTTP_BASE ?? '').trim() || (import.meta.env.DEV ? '/api' : '');
const apiWsPath = (import.meta.env.VITE_API_WS_PATH ?? '').trim() || '/socket.io';

if (!import.meta.env.VITE_API_HTTP_BASE && !import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_HTTP_BASE is not set. Requests may fallback to relative paths.');
}

export const env = {
  apiHttpBase,
  apiWsPath,
};
