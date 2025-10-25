import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export default function DebugApi() {
  const [state, setState] = useState<unknown>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    apiGet<{ pong: boolean }>('/api/ping')
      .then((data) => setState(data))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Debug API</h1>
      <p>
        <b>VITE_API_URL:</b>{' '}
        {import.meta.env.VITE_API_URL || '(proxy dev)'}
      </p>
      {state && <pre>{JSON.stringify(state, null, 2)}</pre>}
      {error && <pre style={{ color: 'crimson' }}>{error}</pre>}
      <a href="/health" target="_blank" rel="noreferrer">
        Abrir /health (dev proxy)
      </a>
    </div>
  );
}
