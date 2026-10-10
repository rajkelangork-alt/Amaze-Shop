/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FAF9F6', // Main canvas background
          200: '#F4F1EA',
          300: '#EAE5D9',
        },
        slate: {
          surface: '#FFFFFF', // Card and module surfaces
          muted: '#64748B',  // Neutral secondary labels & captions
          dark: '#1E293B',   // High-contrast legible body text
          border: '#E2E8F0', // Subdued structural borders
        },
        aqua: {
          50: '#F0FDF4',
          100: '#E0F2FE', // Badges, chips, subtle highlight fills
          400: '#38BDF8',
          500: '#0EA5E9', // Primary CTA button & active states
          600: '#0284C7', // Hover state
          700: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}