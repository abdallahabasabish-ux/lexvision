ت /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#393536",
        secondary: "#bd9d60",
        "secondary-light": "#e1b076",
        white: "#FFFFFF",
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B"
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        english: ["Inter", "sans-serif"]
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
}
