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
        background: withOpacity('--color-background'),
        surface: withOpacity('--color-surface'),
        border: withOpacity('--color-border'),
        muted: withOpacity('--color-muted'),
        foreground: withOpacity('--color-foreground'),
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          hover: withOpacity('--color-primary-hover'),
        },
        accent: withOpacity('--color-accent'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        DEFAULT: 'var(--radius-md)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
      },
      spacing: {
        gapxs: 'var(--space-gap-xs)',
        gapsm: 'var(--space-gap-sm)',
        gapmd: 'var(--space-gap-md)',
        gaplg: 'var(--space-gap-lg)',
        gapxl: 'var(--space-gap-xl)',
      },
    },
  },
  darkMode: ['class', '[data-theme="dark"]'],
};
