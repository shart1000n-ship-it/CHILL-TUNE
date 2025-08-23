/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'martin': {
          'purple': '#4C1D95',      // Deep purple like Star's apartment
          'burgundy': '#7C2D12',    // Rich burgundy for depth
          'deep': '#1E1B4B',        // Deep navy for contrast
          'gold': '#F59E0B',        // Warm gold for highlights
          'gold-light': '#FBBF24',  // Lighter gold for accents
          'hot-pink': '#EC4899',    // Hot pink like 90s fashion
          'electric-blue': '#06B6D4', // Electric blue for neon effects
        },
        'neon': {
          'pink': '#EC4899',        // Star hot pink
          'blue': '#06B6D4',        // Electric blue
          'green': '#10B981',       // Bright green
          'yellow': '#F59E0B',      // Gold yellow
          'purple': '#8B5CF6',      // Purple accent
        }
      },
      fontFamily: {
        'retro': ['Courier New', 'monospace'],
        'futura': ['Futura', 'Arial', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #EC4899, 0 0 10px #EC4899, 0 0 15px #EC4899' },
          '100%': { boxShadow: '0 0 10px #EC4899, 0 0 20px #EC4899, 0 0 30px #EC4899' },
        }
      }
    },
  },
  plugins: [],
}
