/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: '#12151A',
        'dark-slate': '#1A1F26',
        'jet-black': '#0D0F12',
        'charcoal-gray': '#242933',
        'steel-blue': '#3B82F6',
        'slate-blue': '#4F46E5',
        'emerald-green': '#10B981',
        'cobalt-blue': '#2563EB',
        indigo: '#6366F1',
        amber: '#F59E0B',
        'crimson-red': '#EF4444',
        'jade-green': '#10B981',
        gold: '#EAB308',
        silver: '#9CA3AF',
        bronze: '#D97706',
        'snow-white': '#F9FAFB',
        'cool-gray': '#9CA3AF',
        gunmetal: '#2D3748',
        'electric-purple': '#8B5CF6',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
