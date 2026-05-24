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
        primary: {
          DEFAULT: '#0ea5e9', // sky-500
          container: '#0284c7', // sky-600
        },
        secondary: '#6366f1', // indigo-500
        outline: {
          DEFAULT: '#64748b', // slate-500
          variant: '#334155', // slate-700
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
