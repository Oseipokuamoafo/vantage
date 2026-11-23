import type { Config } from 'tailwindcss';

// Theme values come from CSS variables in src/styles/tokens.css (single source of truth).
const v = (name: string) => `var(--${name})`;
const c = (name: string) => `rgb(var(--rgb-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: c('page'),
        surface: c('surface'),
        tint: c('tint'),
        primary: { DEFAULT: c('primary'), hover: c('primary-hover'), active: c('primary-active') },
        navy: c('navy'),
        body: c('body'),
        muted: c('muted'),
        border: { DEFAULT: c('border'), strong: c('border-strong') },
        amber: { DEFAULT: c('amber'), line: c('amber-line'), soft: c('amber-soft') },
        danger: { DEFAULT: c('red'), soft: c('red-soft') },

        // Legacy aliases so every screen picks up the new palette from one place.
        ink: { DEFAULT: c('navy'), soft: c('body'), muted: c('muted') },
        paper: { DEFAULT: c('page'), raised: c('surface'), sunk: c('tint') },
        line: { DEFAULT: c('border'), strong: c('border-strong') },
        accent: { DEFAULT: c('primary'), strong: c('primary-hover'), soft: c('tint') },
        caution: { DEFAULT: c('amber'), soft: c('amber-soft') },
        alert: { DEFAULT: c('red'), soft: c('red-soft') },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: { content: '75rem' },
      borderRadius: {
        card: v('radius-card'),
        nav: v('radius-nav'),
        input: v('radius-input'),
        hero: v('radius-card'),
      },
      boxShadow: {
        soft: v('shadow-soft'),
        hover: v('shadow-hover'),
        lift: v('shadow-hover'),
      },
      transitionTimingFunction: { brand: v('ease') },
      transitionDuration: { brand: '180ms' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        draw: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
        pop: {
          from: { opacity: '0', transform: 'scale(0.4)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        draw: 'draw 1.6s cubic-bezier(0.65,0,0.35,1) both',
        pop: 'pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
