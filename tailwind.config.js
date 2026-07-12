/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) lets Tailwind's opacity modifiers
        // (e.g. text-ink/70) keep working while the base value flips with
        // the .dark class — see :root/.dark in styles.css for the values.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        panel: "var(--color-panel)"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(15, 23, 42, 0.08)",
        card: "0 1px 1px rgba(15, 23, 42, 0.04), 0 14px 36px rgba(15, 23, 42, 0.07)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
