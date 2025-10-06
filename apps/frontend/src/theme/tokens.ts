export type ThemeMode = 'light' | 'dark';

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const;

export const shadows = {
  soft: '0 1px 3px rgba(0, 0, 0, 0.06)',
  elevated: '0 6px 24px rgba(0, 0, 0, 0.08)',
  softDark: '0 1px 3px rgba(15, 23, 42, 0.4)',
  elevatedDark: '0 8px 30px rgba(15, 23, 42, 0.5)',
} as const;

export const gaps = {
  xs: '6px',
  sm: '10px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const palette = {
  light: {
    background: '#f5f7fb',
    surface: '#ffffff',
    border: '#e5e7eb',
    muted: '#6b7280',
    foreground: '#0f172a',
    primary: '#5b5bd6',
    primaryHover: '#4b4bc4',
    accent: '#6f4fd9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    border: '#273549',
    muted: '#9ca3af',
    foreground: '#f8fafc',
    primary: '#5b5bd6',
    primaryHover: '#4b4bc4',
    accent: '#6f4fd9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
} as const;

export const themeStorageKey = 'agenda-amiga:theme';

export const tokens = {
  radii,
  shadows,
  gaps,
  palette,
} as const;

export function applyThemeTokens(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', mode);

  const colors = palette[mode];
  Object.entries(colors).forEach(([name, value]) => {
    root.style.setProperty(`--color-${kebabCase(name)}`, normalizeColorValue(value));
  });

  const isDark = mode === 'dark';
  root.style.setProperty('--shadow-soft', isDark ? shadows.softDark : shadows.soft);
  root.style.setProperty('--shadow-elevated', isDark ? shadows.elevatedDark : shadows.elevated);

  Object.entries(radii).forEach(([name, value]) => {
    root.style.setProperty(`--radius-${name}`, value);
  });

  Object.entries(gaps).forEach(([name, value]) => {
    root.style.setProperty(`--space-gap-${name}`, value);
  });
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function initializeTheme() {
  const stored = getStoredTheme();
  const mode = stored ?? getSystemTheme();
  applyThemeTokens(mode);
  return mode;
}

export function persistTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(themeStorageKey, mode);
  applyThemeTokens(mode);
}

function kebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function normalizeColorValue(value: string) {
  if (value.includes(' ')) {
    return value;
  }
  if (value.startsWith('#')) {
    const hex = value.replace('#', '');
    const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
  }
  return value;
}

