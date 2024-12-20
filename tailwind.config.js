/** @type {import('tailwindcss').Config} */
import tailwindscrollbars from 'tailwind-scrollbar';
import reactglow from '@codaworks/react-glow/tailwind';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindscrollbars,
    reactglow
  ],
}