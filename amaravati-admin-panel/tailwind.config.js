/** @type {import('tailwindcss').Config} */
module.exports = {
  // These are the files Tailwind will scan for class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // All React components/pages
    "./public/index.html"         // Your HTML file
  ],
  theme: {
    extend: {
      // Add custom colors, fonts, spacing, etc.
      colors: {
        primary: "#2563eb", // blue-600
        secondary: "#64748b", // slate-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    // Add extra plugins here (forms, typography, aspect-ratio)
    require('@tailwindcss/forms'),
  ],
};
