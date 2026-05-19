import meta from "./site/meta.json" with { type: "json" };

export default {
  content: [
    "./site/**/*.{html,ts}",
    "./pages/**/*.md",
    "./books/**/*.md",
  ],
  theme: {
    extend: {
      colors: meta.colors,
      fontFamily: {
        monospace: "monospace",
      },
    },
  },
};
