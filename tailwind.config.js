/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        cursive: ['Dancing Script', 'cursive'],
        nourd: ['Nourd', 'Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          silver: '#9FA8B5',
          steel: '#5B6C7F',
          navy: '#38393A',
          dark: '#0E141E',
          white: '#FFFFFF',
          logistics: '#38393A',
          accent: '#68696c',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        elegant: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
