import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { env } from '../core/config/env';

export default function DebugApi() {
  const [state, setState] = useState<unknown>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    apiGet<{ pong: boolean }>('/api/ping')
      .then((data) => setState(data))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Debug API</h1>
      <p>
        <b>API base:</b> {env.apiHttpBase || '(proxy dev)'}
      </p>
      {state && <pre>{JSON.stringify(state, null, 2)}</pre>}
      {error && <pre style={{ color: 'crimson' }}>{error}</pre>}
      <a href="/health" target="_blank" rel="noreferrer">
        Abrir /health (dev proxy)
      </a>
    </div>
  );
}
