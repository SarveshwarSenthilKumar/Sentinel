import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f0e6",
        surface: "#fbf5eb",
        elevated: "#fffaf2",
        paper: "#f6efe5",
        ink: "#0e2433",
        safe: "#16805d",
        review: "#d98a1b",
        block: "#b9382f",
        panel: "#fff9f1",
        muted: "#6a7882",
        line: "#dcc9af",
        accent: "#2a5672",
      },
      boxShadow: {
        frame: "0 18px 60px rgba(14, 36, 51, 0.1)",
      },
      backgroundImage: {
        "sentinel-glow":
          "radial-gradient(circle at top left, rgba(217,138,27,0.14), transparent 34%), radial-gradient(circle at top right, rgba(22,128,93,0.12), transparent 30%), linear-gradient(135deg, #f7f0e6 0%, #fffaf3 50%, #f3e7d7 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
