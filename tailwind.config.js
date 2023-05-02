/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'normal': '#c9d1d9',
        'normal-alt': '#f0f6fc',
        'subdued': '#666672',
        'inverted': '#0d1117',
        bg: {
          'normal': '#21262e',
          'normal-alt': '#30363d'
        },
        border: {
          'normal': '#30363d',
          'normal-alt': '#484f58',
          'subdued': '#21262d'
        },
        brand: 'rgb(var(--color-brand) / <alpha-value>)'
        // brand: '#8866ff'
      }
    },
  },

  plugins: [],
}