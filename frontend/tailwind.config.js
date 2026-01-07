/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom AstroSoft Color Palette
        astro: {
          dark: "#0a0e17", // Deep background like space
          card: "#131b2c", // Slightly lighter for cards
          blue: "#2563eb", // Primary brand blue from logo
          "light-blue": "#60a5fa", // Bright accent blue from logo stars/rocket
          text: "#f8fafc", // Almost white text
          "text-muted": "#94a3b8", // Grayed out text
        },
      },
    },
  },
  plugins: [],
};
