/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#020617', // Slate 950 base
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#D4AF37', // Metallic Gold
          glow: '#F4E4BC',
        },
        emerald: {
          900: '#064e3b',
          800: '#065f46',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      boxShadow: {
        'glow-gold': '0 0 40px -10px rgba(212, 175, 55, 0.3)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
