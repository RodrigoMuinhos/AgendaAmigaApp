export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status} - ${message}`);
  }

  return res.json() as Promise<T>;
}
