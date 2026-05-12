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
          900: "#FFFFFF",
          800: "#F8F9FC",
          700: "#F1F3F8",
          600: "#E2E8F0",
          500: "#CBD5E1",
          400: "#94A3B8",
        },
        navy: {
          400: "#4F7AC7",
          500: "#1E3A8A",
          600: "#162D6E",
        },
        jade: {
          400: "#059669",
          500: "#047857",
        },
        rose: {
          400: "#DC2626",
          500: "#B91C1C",
        },
        sky: {
          400: "#0284C7",
          500: "#0369A1",
        },
        amber: {
          400: "#D97706",
          500: "#B45309",
          600: "#92400E",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(30, 58, 138, 0.15)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
