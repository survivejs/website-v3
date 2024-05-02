import hljs from "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/es/core.min.js";
import highlightBash from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/bash.js";
import highlightC from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/c.js";
import highlightCSS from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/css.js";
import highlightHaskell from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/haskell.js";
import highlightIni from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/ini.js";
import highlightJS from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/javascript.js";
import highlightJSON from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/json.js";
import highlightMakefile from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/makefile.js";
import highlightMarkdown from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/markdown.js";
import highlightSCSS from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/scss.js";
import highlightSQL from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/sql.js";
import highlightTS from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/typescript.js";
import highlightXML from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/xml.js";
import highlightYAML from "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/es/languages/yaml.js";

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
