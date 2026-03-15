import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5EC",
          100: "#FFE5D0",
          200: "#FFCFAA",
          300: "#FFBA85",
          400: "#FFA461",
          500: "#FF8A3D",
          600: "#E87530",
          700: "#CC6225",
          800: "#A64F1D",
          900: "#803C16",
        },
        accent: {
          50: "#FFFDE6",
          100: "#FFFABD",
          200: "#FFF794",
          300: "#FFF46B",
          400: "#FFF142",
          500: "#FFE812",
          600: "#E6D00F",
          700: "#BFA80C",
        },
        community: {
          50: "#EDFAF2",
          100: "#D0F2E0",
          200: "#A3E5C3",
          300: "#6DD9A3",
          400: "#2EB67D",
          500: "#289F6D",
          600: "#21875C",
          700: "#1A6F4B",
        },
        coral: {
          50: "#fff5f5",
          100: "#ffe0e0",
          400: "#ff6b6b",
          500: "#ff5252",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#FFF9E6",
          tertiary: "#f3f4f6",
        },
        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        brand: {
          bg: "#FFF9E6",
          warm: "#FFF5EC",
          tae: "#FFE812",
          ja: "#FF8A3D",
        },
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 10px 25px -5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)",
        "nav": "0 -2px 24px rgb(0 0 0 / 0.08), 0 -1px 4px rgb(0 0 0 / 0.04)",
        "hero": "0 12px 40px -12px rgb(255 138 61 / 0.35)",
        "brand": "0 4px 20px -4px rgb(255 232 18 / 0.30)",
        "glow": "0 0 20px rgb(255 232 18 / 0.25)",
        toast: "0 4px 12px rgb(0 0 0 / 0.12)",
        modal: "0 20px 60px rgb(0 0 0 / 0.15)",
        "float": "0 8px 32px -8px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        skeleton: "skeleton 1.5s ease-in-out infinite",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-3px) rotate(1deg)" },
          "66%": { transform: "translateY(1px) rotate(-1deg)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
