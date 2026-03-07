import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F5F5F0",
          dark: "#E8E8E0",
        },
        sage: {
          DEFAULT: "#5A5A40",
          light: "#6B6B50",
          hover: "#4A4A35",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          light: "#4A4A4A",
          soft: "#6A6A6A",
        },
        // Keep burnt-orange for cost indicators in GenerationSummary
        "burnt-orange": {
          DEFAULT: "#C85A2A",
          light: "#E06A35",
        },
        // Platform brand colors
        platform: {
          linkedin: "#0A66C2",
          threads: "#000000",
          instagram: "#E1306C",
          pinterest: "#E60023",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
