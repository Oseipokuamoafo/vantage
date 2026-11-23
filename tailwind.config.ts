import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#16202e', soft: '#3d4a5c', muted: '#556274' },
        paper: { DEFAULT: '#f7f5f0', raised: '#ffffff', sunk: '#eeeae1' },
        line: { DEFAULT: '#d9d3c7', strong: '#b9b0a0' },
        accent: { DEFAULT: '#0d6b63', strong: '#0a524c', soft: '#e3f1ee' },
        caution: { DEFAULT: '#8a4b0a', soft: '#fbefdc' },
        alert: { DEFAULT: '#a12a2a', soft: '#fbe5e3' },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      maxWidth: { content: '72rem' },
    },
  },
  plugins: [],
} satisfies Config;
