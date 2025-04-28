
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {}, // Add nesting plugin before Tailwind
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
