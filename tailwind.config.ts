import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // African-inspired color palette
        primary: {
          50: '#fef7f0',
          100: '#fdebd9',
          200: '#fad4b1',
          300: '#f6b57f',
          400: '#f18c4a',
          500: '#ec6c24', // Main terracotta
          600: '#d4511a',
          700: '#b03d17',
          800: '#8d321a',
          900: '#722b18',
          950: '#3e130a',
        },
        secondary: {
          50: '#fdfaeb',
          100: '#faf2c9',
          200: '#f5e38f',
          300: '#efce4c',
          400: '#e9ba23',
          500: '#d99f13', // Deep gold/ochre
          600: '#bc7a0e',
          700: '#96570f',
          800: '#7b4514',
          900: '#683917',
          950: '#3c1d08',
        },
        earth: {
          50: '#f9f6f3',
          100: '#f0ebe4',
          200: '#dfd5c7',
          300: '#cbb9a3',
          400: '#b5997d',
          500: '#a68264', // Warm sienna
          600: '#996f55',
          700: '#805a48',
          800: '#694a3e',
          900: '#573f35',
          950: '#2e201b',
        },
        bark: {
          50: '#f7f5f4',
          100: '#edebe8',
          200: '#dbd5d0',
          300: '#c3b9b1',
          400: '#a89a8e',
          500: '#938275', // Neutral brown
          600: '#867467',
          700: '#6f5f55',
          800: '#5c5049',
          900: '#4d443f',
          950: '#292321',
        },
        kente: {
          gold: '#d4a012',
          red: '#c41e3a',
          green: '#228b22',
          black: '#1a1a1a',
        },
        mudcloth: {
          cream: '#f5f0e6',
          brown: '#5c4033',
          rust: '#a0522d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-earth': 'linear-gradient(135deg, #f9f6f3 0%, #f0ebe4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #fef7f0 0%, #fdebd9 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ec6c24 0%, #d99f13 100%)',
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(196, 92, 38, 0.15)',
        'warm-lg': '0 10px 40px 0 rgba(196, 92, 38, 0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config