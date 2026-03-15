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
        'dark-bg': '#0f172a',
        'dark-sidebar': '#1e293b',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'dark-text': '#e2e8f0',
        'dark-text-secondary': '#94a3b8',
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'accent-amber': '#f59e0b',
      },
      spacing: {
        sidebar: '256px',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
