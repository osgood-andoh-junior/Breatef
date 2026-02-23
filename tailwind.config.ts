// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: "#FFD700",
          DEFAULT: "#DAA520",
          dark: "#B8860B",
        },
        glowgreen: {
          light: "#00FF66",
          DEFAULT: "#00CC55",
          dark: "#009944",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
      },
    },
  },
  darkMode: "class", // allows you to toggle manually with document.documentElement.classList.toggle("dark")
  plugins: [],
};

export default config;

