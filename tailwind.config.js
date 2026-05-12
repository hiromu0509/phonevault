/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        surface: {
          900: "#0A0B0F",
          800: "#10121A",
          700: "#161923",
          600: "#1E2330",
          500: "#252C3D",
          400: "#2E3650",
        },
        amber: {
          400: "#FFC542",
          500: "#FFB800",
          600: "#E6A600",
        },
        jade: {
          400: "#34D399",
          500: "#10B981",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
        },
        sky: {
          400: "#38BDF8",
          500: "#0EA5E9",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 197, 66, 0.15)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
