/** @type {import('tailwindcss').Config} */
module.exports = {
  // This 'content' array tells Tailwind to scan all .js, .jsx, .ts, and .tsx
  // files within your 'src' folder and any of its subfolders.
  // THIS IS THE MOST IMPORTANT PART FOR THE FIX.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // You can use these custom colors in your App.js,
      // e.g., className="bg-autoslot-dark"
      colors: {
        'autoslot-orange': '#C16D00',
        'autoslot-dark': '#262525',
        'autoslot-card': '#40403E',
      },
    },
  },
  plugins: [],
}