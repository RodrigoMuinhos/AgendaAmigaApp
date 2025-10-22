const withOpacity = (variable) => ({ opacityValue }) => {
  if (opacityValue === undefined) {
    return `rgb(var(${variable}) / 1)`;
  }
  return `rgb(var(${variable}) / ${opacityValue})`;
};

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        border: withOpacity('--color-border'),
        text: withOpacity('--color-text'),
        muted: withOpacity('--color-muted'),
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          dark: withOpacity('--color-primary-dark'),
        },
        accent: withOpacity('--color-accent'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
        DEFAULT: 'var(--radius-md)',
      },
      fontFamily: {
        sans: [
          '"Source Sans 3"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 6px 18px rgba(14, 23, 38, 0.08)',
        elevated: '0 12px 32px rgba(14, 23, 38, 0.12)',
      },
    },
  },
  plugins: [],
};
