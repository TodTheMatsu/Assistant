/** @type {import('tailwindcss').Config} */
import tailwindscrollbars from 'tailwind-scrollbar';
import reactglow from '@codaworks/react-glow/tailwind';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-charcoal': '#1a1a1a',
        'dark-gray': '#3d3d3d',
        'sage': '#6b7f6e',
        'light-beige': '#e8d7c3',
      },
    },
  },
  plugins: [
    tailwindscrollbars,
    reactglow
  ],
}