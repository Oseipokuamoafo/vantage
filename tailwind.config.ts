import type { Config } from 'tailwindcss';

// Vantage tokens: topographic-map palette (pine ink, mist, contour lines, trail blaze, marker yellow).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0f2a26', soft: '#36504a', muted: '#53675f' },
        paper: { DEFAULT: '#f4f6f3', raised: '#ffffff', sunk: '#e7ece8' },
        line: { DEFAULT: '#d3dcd7', strong: '#a9b8b1' },
        accent: { DEFAULT: '#1f4fd8', strong: '#1638a8', soft: '#e6ecfc' },
        marker: { DEFAULT: '#f2c230', soft: '#fdf4d3' },
        caution: { DEFAULT: '#8a5a00', soft: '#fbf1d9' },
        alert: { DEFAULT: '#b42318', soft: '#fde8e6' },
        // Opportunity types: validated categorical slots, always paired with a shape.
        type: {
          certification: '#2a78d6',
          side_project: '#eb6834',
          student_org: '#1baf7a',
          internship: '#eda100',
          research_reu: '#e87ba4',
        },
      },
      fontFamily: {
        sans: [
          '"Overpass Variable"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Overpass Variable"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: { content: '74rem' },
      borderRadius: { hero: '1.75rem' },
      boxShadow: {
        lift: '0 1px 0 rgba(15,42,38,0.04), 0 10px 24px -12px rgba(15,42,38,0.28)',
      },
      keyframes: {
        draw: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
        pop: {
          from: { opacity: '0', transform: 'scale(0.4)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        draw: 'draw 1.6s cubic-bezier(0.65,0,0.35,1) both',
        pop: 'pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
