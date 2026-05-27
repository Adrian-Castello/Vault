/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Surfaces
        bg: {
          light: '#FAFAFA',
          dark: '#0A0A0B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#141416',
        },
        border: {
          light: '#E5E7EB',
          dark: '#27272A',
        },
        ink: {
          light: '#0A0A0A',
          dark: '#FAFAFA',
        },
        muted: {
          light: '#6B7280',
          dark: '#A1A1AA',
        },
        // Accents
        mint: {
          light: '#6EE7B7',
          DEFAULT: '#34D399',
        },
        violet: {
          light: '#A78BFA',
          DEFAULT: '#8B5CF6',
        },
        alert: '#EF4444',
        warm: '#F59E0B',
      },
      boxShadow: {
        'card-light': '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        'card-light-hover': '0 4px 12px rgba(16, 24, 40, 0.08)',
        'glow-mint': '0 0 0 1px rgba(52, 211, 153, 0.15), 0 8px 24px rgba(52, 211, 153, 0.12)',
        'glow-violet': '0 0 0 1px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(139, 92, 246, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
