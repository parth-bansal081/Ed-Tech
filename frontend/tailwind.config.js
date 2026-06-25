/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'bg-primary': '#0b0f19', // Cosmic Midnight
        'bg-surface': '#161e33', // Deep Navy Space Pods
        'bg-surface-alt': '#1f294d', // Lighter navy surface
        'text-primary': '#f8fafc', // Bright white
        'text-secondary': '#cbd5e1', // Light slate
        'border-subtle': 'rgba(56,189,248,0.15)', // Soft blue spark
        'border-strong': 'rgba(251,191,36,0.25)', // Sunny yellow glow border
        'accent-amber': '#fbbf24', // Sunny yellow stars
        'accent-teal': '#2dd4bf', // Bubblegum teal
        'accent-coral': '#f87171', // Toy coral red
        'accent-violet': '#a855f7', // Rocket purple
        'status-success': '#4ade80',
        'status-warning': '#fbbf24',
        'status-error': '#f87171',
        primary: {
          DEFAULT: '#fbbf24', // Sunny Yellow
          container: '#d97706',
        },
        secondary: '#38bdf8', // Friendly Blue
        outline: {
          DEFAULT: '#475569',
          variant: '#334155',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
