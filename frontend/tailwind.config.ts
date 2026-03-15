import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        safe: "var(--color-safe)",
        review: "var(--color-review)",
        block: "var(--color-block)",
        panel: "var(--color-panel)",
        muted: "var(--color-muted)",
        line: "rgb(var(--color-line-rgb) / <alpha-value>)",
        accent: "var(--color-accent)",
      },
      boxShadow: {
        frame: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "sentinel-glow":
          "radial-gradient(circle at top left, var(--glow-primary), transparent 34%), radial-gradient(circle at top right, var(--glow-secondary), transparent 30%), linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-mid) 45%, var(--gradient-end) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
