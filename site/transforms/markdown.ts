import { install, tw } from "https://esm.sh/@twind/core@1.1.1";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js";
import highlight from "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/es/core.min.js";
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
import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { urlJoin } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";
import twindSetup from "../twindSetup.ts";
import type { DataSourcesApi } from "https://deno.land/x/gustwind@v0.70.3/types.ts";

// load() doesn't check env, just possible .dev.vars file
const env = await load({ envPath: "./.dev.vars" });

highlight.registerLanguage("bash", highlightBash);
highlight.registerLanguage("c", highlightC);
highlight.registerLanguage("clike", highlightC);
highlight.registerLanguage("css", highlightCSS);
highlight.registerLanguage("haskell", highlightHaskell);
highlight.registerLanguage("ini", highlightIni);
highlight.registerLanguage("html", highlightXML);
highlight.registerLanguage("javascript", highlightJS);
highlight.registerLanguage("js", highlightJS);
highlight.registerLanguage("json", highlightJSON);
highlight.registerLanguage("makefile", highlightMakefile);
highlight.registerLanguage("markdown", highlightMarkdown);
highlight.registerLanguage("scss", highlightSCSS);
highlight.registerLanguage("sql", highlightSQL);
highlight.registerLanguage("typescript", highlightTS);
highlight.registerLanguage("ts", highlightTS);
highlight.registerLanguage("xml", highlightXML);
highlight.registerLanguage("yaml", highlightYAML);

// TODO: Get this from marked types instead
type Token = {
  depth?: number;
  raw?: string;
  text?: string;
  type: "heading" | "paragraph" | "text";
  tokens?: Token[];
};

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  highlight: (code: string, language: string) => {
    try {
      // TODO: Is it a good idea to highlight as bash by default?
      return highlight.highlight(code, { language: language || "bash" }).value;
    } catch (error) {
      console.error("Missing a known language for", code);
      console.error(error);
    }
  },
});

install(twindSetup);

function getTransformMarkdown({ load, render }: DataSourcesApi) {
  marked.use({
    walkTokens: (token: Token) => {
      if (token.type === "paragraph") {
        return (
          parseCustomQuote(token, "T>", "tip") ||
          parseCustomQuote(token, "W>", "warning") ||
          token
        );
      }
    },
  });

  return async function transformMarkdown(input: string) {
    if (typeof input !== "string") {
      console.error("input", input);
      throw new Error("transformMarkdown - passed wrong type of input");
    }

    // https://github.com/markedjs/marked/issues/545
    const tableOfContents: { slug: string; level: number; text: string }[] = [];

    marked.use({
      async: true,
      walkTokens: async (token: Token) => {
        if (token.type === "heading") {
          const { text, depth: level } = token;
          const slug = text ? slugify(text) : "";

          // @ts-expect-error This is fine
          tableOfContents.push({ slug, level, text: token.text });

          const html = await render({
            // TODO: Reduce this just to a Heading to eliminate the duplicate
            // TODO: Figure out why componentName/props doesn't do the same as htmlInput
            // Maybe component utilities don't get passed properly then.
            /*componentName: "Heading",
            props: {
              showAnchor: true,
              anchor: slug,
              level,
              children: token.text,
            },*/
            htmlInput:
              `<HeadingWithAnchor anchor="${slug}" level="${level}" children="${token.text}" />`,
          });

          // TODO: Maybe this solution is missing something (fails at the build)
          token.tokens = [{ type: "text", text: html }];

          return token;
        }
      },
    });

    // https://marked.js.org/using_pro#renderer
    // https://github.com/markedjs/marked/blob/master/src/Renderer.js
    marked.use({
      renderer: {
        code(code: string, infostring: string): string {
          const lang = ((infostring || "").match(/\S*/) || [])[0];

          // @ts-ignore How to type this?
          if (this.options.highlight) {
            // @ts-ignore How to type this?
            const out = this.options.highlight(code, lang);

            if (out != null && out !== code) {
              code = out;
            }
          }

          code = code.replace(/\n$/, "") + "\n";

          if (!lang) {
            return "<pre><code>" +
              code +
              "</code></pre>\n";
          }

          return '<pre class="' +
            '"><code class="' +
            // @ts-ignore How to type this?
            (this.options.langPrefix || "") +
            lang +
            '">' +
            code +
            "</code></pre>\n";
        },
        heading: (text: string) => text,
        image(href: string, title: string, text: string) {
          const textParts = text ? text.split("|") : [];
          const alt = textParts[0] || "";
          const width = textParts[1] || "";
          const height = textParts[2] || "";
          const className = textParts[3] || "";

          // TODO: Rewrite book image urls
          if (!href.startsWith("http")) {
            // Rewrite blog urls to look from root
            if (href.startsWith("assets/")) {
              href = `/${href}`;
            }

            if (env.IMAGES_ROOT) {
              href = urlJoin(env.IMAGES_ROOT, href);
            }
          }

          return `<figure class="not-prose my-0 ${className}">
            <img class="${
            className === "author" ? "" : "border"
          }" src="${href}" loading="lazy" alt="${alt}" title="${title}" width="${width}" height="${height}" />
            <figcaption class="text-center text-sm">${alt}</figcaption>
          </figure>`;
        },
        link(href: string, title: string, text: string) {
          if (href === null) {
            return text;
          }

          if (text === "<file>") {
            // TODO: Show a nice error in case href is not found in the fs
            const fileContents = load.textFileSync(href);

            return this.code(fileContents, href.split(".").at(-1) as string);
          }

          let out = '<a class="' + tw("underline") + '" href="' + href + '"';
          if (title) {
            out += ' title="' + title + '"';
          }
          out += ">" + text + "</a>";
          return out;
        },
        list(body: string, ordered: string, start: number) {
          const type = ordered ? "ol" : "ul",
            startatt = (ordered && start !== 1)
              ? (' start="' + start + '"')
              : "",
            klass = ordered
              ? "list-decimal list-inside"
              : "list-disc list-inside";
          return "<" + type + startatt + ' class="' + tw(klass) + '">\n' +
            body +
            "</" +
            type + ">\n";
        },
        paragraph(text: string) {
          // Skip pagebreaks
          if (text === "{pagebreak}") {
            return "";
          }

          return `<p>${text}</p>\n`;
        },
      },
    });

    return { content: await marked(input), tableOfContents };
  };
}

function parseCustomQuote(
  token: Token,
  match: string,
  className: string,
) {
  const text = token.text;

  if (text?.indexOf(match) === 0) {
    const textIcon = className === "tip" ? "!" : "?";

    // @ts-expect-error This is fine for now
    token.tokens[0].text = token.tokens[0].text.replace(
      match.replace(">", "&gt;"),
      `<div class="inline-block rounded-full bg-muted text-white w-8 h-8 -ml-9 text-center">${textIcon}</div>`,
    );

    return token;
  }
}

function slugify(idBase: string) {
  return idBase
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w]+/g, "-");
}

export default getTransformMarkdown;
