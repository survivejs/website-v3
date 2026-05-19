import hljs from "highlight.js/lib/core";
import highlightBash from "highlight.js/lib/languages/bash";
import highlightC from "highlight.js/lib/languages/c";
import highlightCSS from "highlight.js/lib/languages/css";
import highlightHaskell from "highlight.js/lib/languages/haskell";
import highlightIni from "highlight.js/lib/languages/ini";
import highlightJS from "highlight.js/lib/languages/javascript";
import highlightJSON from "highlight.js/lib/languages/json";
import highlightMakefile from "highlight.js/lib/languages/makefile";
import highlightMarkdown from "highlight.js/lib/languages/markdown";
import highlightSCSS from "highlight.js/lib/languages/scss";
import highlightSQL from "highlight.js/lib/languages/sql";
import highlightTS from "highlight.js/lib/languages/typescript";
import highlightXML from "highlight.js/lib/languages/xml";
import highlightYAML from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("bash", highlightBash);
hljs.registerLanguage("c", highlightC);
hljs.registerLanguage("clike", highlightC);
hljs.registerLanguage("css", highlightCSS);
hljs.registerLanguage("haskell", highlightHaskell);
hljs.registerLanguage("ini", highlightIni);
hljs.registerLanguage("html", highlightXML);
hljs.registerLanguage("javascript", highlightJS);
hljs.registerLanguage("js", highlightJS);
hljs.registerLanguage("json", highlightJSON);
hljs.registerLanguage("makefile", highlightMakefile);
hljs.registerLanguage("markdown", highlightMarkdown);
hljs.registerLanguage("scss", highlightSCSS);
hljs.registerLanguage("sql", highlightSQL);
hljs.registerLanguage("typescript", highlightTS);
hljs.registerLanguage("ts", highlightTS);
hljs.registerLanguage("xml", highlightXML);
hljs.registerLanguage("yaml", highlightYAML);

function highlight(code: string, language?: string) {
  try {
    // TODO: Is it a good idea to highlight as bash by default?
    return hljs.highlight(
      // The problem is that delete is a keyword in JavaScript
      // so it has to be obscured.
      code.replace(
        new RegExp("leanpub-start-delete", "gi"),
        "leanpub-start-del",
      ).replace(
        new RegExp("leanpub-end-delete", "gi"),
        "leanpub-end-del",
      ),
      { language: language || "bash" },
    ).value
      .replace(
        new RegExp("leanpub-start-insert\n", "gi"),
        '<div class="hljs-addition inline">',
      ).replace(
        new RegExp("\nleanpub-end-insert", "gi"),
        "</div>",
      ).replace(
        new RegExp("leanpub-start-del\n", "gi"),
        '<div class="hljs-deletion inline">',
      ).replace(
        new RegExp("\nleanpub-end-del", "gi"),
        "</div>",
      );
  } catch (error) {
    console.error("Missing a known language for", code);
    console.error(error);
  }
}

export { highlight };
