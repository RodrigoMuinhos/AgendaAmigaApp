import { useEffect, useState } from 'react';
import { apiGet } from './lib/api';

type ProbeStatus = 'ok' | 'erro' | 'carregando';

type HealthProbeProps = {
  size?: number;
};

function resolveColor(status: ProbeStatus) {
  switch (status) {
    case 'ok':
      return '#16a34a'; // Tailwind emerald-600
    case 'erro':
      return '#dc2626'; // Tailwind red-600
    default:
      return '#9ca3af'; // Tailwind gray-400
  }
}

function resolveLabel(status: ProbeStatus) {
  if (status === 'carregando') {
    return 'checando';
  }

  return status;
}

export function HealthProbe({ size = 20 }: HealthProbeProps) {
  const [status, setStatus] = useState<ProbeStatus>('carregando');

  useEffect(() => {
    apiGet<{ status?: string }>('/health')
      .then((response) => setStatus(response.status === 'ok' ? 'ok' : 'erro'))
      .catch(() => setStatus('erro'));
  }, []);

  const color = resolveColor(status);
  const label = resolveLabel(status);
  const iconSize = Math.max(12, size - 6);

  // Small Wi-Fi icon reflects the API health without extra text.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color,
        transition: 'color 150ms ease',
      }}
      role="img"
      aria-live="polite"
      aria-label={`API ${label}`}
      title={`API ${label}`}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path d="M7.05 11.95a4.15 4.15 0 0 1 5.9 0l1.41-1.41a6.15 6.15 0 0 0-8.72 0l1.41 1.41Z" />
        <path d="M4.22 9.12a8.97 8.97 0 0 1 11.56 0l1.41-1.41a10.97 10.97 0 0 0-14.38 0l1.41 1.41Z" />
      </svg>
    </span>
  );
}
