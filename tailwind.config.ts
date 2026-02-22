import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          earth: "#8B6914",
          gold: "#C5A55A",
          cream: "#FFF8F0",
          forest: "#2D5A27",
          dark: "#1A1A1A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
