/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // X / Twitter Palette
        primary: '#1d9bf0',   // X Blue
        secondary: '#536471', // Slate Gray (Text)
        dark: '#0f1419',      // Black (Text)
        light: '#ffffff',     // White (Background)
        dim: '#eff3f4',       // Light Gray (Hover/Bg)
        border: '#cfd9de',    // Border Color

        // Semantic
        success: '#00ba7c',   // Green
        danger: '#f4212e',    // Red
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      boxShadow: {
        'x': 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
      }
    },
  },
  plugins: [],
}
