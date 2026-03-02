/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  // Safelist covers the dynamically-constructed class names in ContactCard.js
  // (e.g. `bg-${config.color}-100`) which Tailwind can't detect by scanning source.
  safelist: [
    {
      pattern: /bg-(green|blue|indigo|pink|purple|orange)-(100|200)/,
      variants: ['hover'],
    },
    {
      pattern: /text-(green|blue|indigo|pink|purple|orange)-(700|800)/,
    },
    {
      pattern: /border-(green|blue|indigo|pink|purple|orange)-400/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
