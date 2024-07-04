import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.5";
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1.1.1";
import presetTypography from "https://esm.sh/@twind/preset-typography@1.0.5";
import meta from "./meta.json" with { type: "json" };

export default {
  presets: [presetAutoprefix(), presetTailwind(), presetTypography()],
  rules: [
    // https://twind.style/rules#static-rules
    ["mask-text-black", { color: "transparent", textShadow: "0 0 black" }],
    ["mask-text-gray", { color: "transparent", textShadow: "0 0 gray" }],
    ["author", {
      float: "right",
      width: "100px",
      height: "100px",
      marginLeft: "1em",
    }],
    ["text-1", { fontSize: "1px" }],
    ["line-clamp-6", {
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": 6,
    }],
    ["min-w-48", { minWidth: "12rem" }],
    ["min-w-52", { minWidth: "13rem" }],
    ["min-w-56", { minWidth: "14rem" }],
    ["min-h-65", { minHeight: "65vh" }],
    ["max-w-ch80", { maxWidth: "80ch" }],
  ],
  theme: {
    extend: {
      colors: meta.colors,
      fontFamily: {
        // TODO: Update this
        // "primary": 'system-ui, "Eau"',
        "monospace": "monospace",
      },
    },
  },
  hash: false,
};
