/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#171617',
        'dark-text': '#EAE7D3',
        'light-bg': '#F4EDDE',
        'light-text': '#171617',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'draw': 'draw 0.5s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        draw: {
          'to': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}

