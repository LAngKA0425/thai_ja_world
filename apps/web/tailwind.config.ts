import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#145A46',
        secondary: '#E8F5E9',
        accent: '#95E1D3',
        'cute-pink': '#C8E6C9',
        'cute-peach': '#A5D6A7',
        'cute-purple': '#D4A5FF',
        'cute-blue': '#A5D4FF',
      },
      fontFamily: {
        'cute': ['"Comic Sans MS"', 'cursive', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        'safe-top': 'max(env(safe-area-inset-top), 0)',
        'safe-bottom': 'max(env(safe-area-inset-bottom), 0)',
        'safe-left': 'max(env(safe-area-inset-left), 0)',
        'safe-right': 'max(env(safe-area-inset-right), 0)',
      },
      borderRadius: {
        'cute': '20px',
        'cute-lg': '30px',
      },
      boxShadow: {
        'cute': '0 4px 12px rgba(20, 90, 70, 0.1)',
        'cute-lg': '0 8px 24px rgba(20, 90, 70, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-cute': 'pulse-cute 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-cute': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
