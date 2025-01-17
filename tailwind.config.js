/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',     // Smaller text like timestamps
        'sm': '13px',     // Secondary text
        'base': '15px',   // Main text
        'lg': '18px',     // Headers
        'xl': '20px',     // Large headers
      },
      colors: {
        'sidebar-dark': '#1A1D21',
        'sidebar-hover': '#27242C',
        'sidebar-active': '#1F1C23',
        'sidebar-light': '#2F2A35',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(to right, #1A1D21, #2F2A35)',
        'topbar-gradient': 'linear-gradient(to left, #1A1D21, #2F2A35)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'message': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}