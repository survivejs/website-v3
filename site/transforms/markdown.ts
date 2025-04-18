import { install, tw } from "https://esm.sh/@twind/core@1.1.1";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js";
// import type { Token } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.d.ts";
import { markedSmartypants } from "npm:marked-smartypants@1.1.6";
import smartypants from "npm:smartypants@0.2.2";
import { highlight } from "./utilities/highlight.ts";
import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { urlJoin } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";
import twindSetup from "../twindSetup.ts";
import type { DataSourcesApi } from "https://deno.land/x/gustwind@v0.71.0/types.ts";

// load() doesn't check env, just possible .dev.vars file
const env = await load({ envPath: "./.dev.vars" });

// TODO: Get this from marked types instead
type Token = {
  depth?: number;
  raw?: string;
  text?: string;
  type: "heading" | "paragraph" | "text";
  tokens?: Token[];
};

marked.use(markedSmartypants());
marked.setOptions({ highlight });

// @ts-expect-error This is fine
install(twindSetup);

function getTransformMarkdown({ load, renderSync }: DataSourcesApi) {
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

  // TODO: Merge parameters into a single object
  return function transformMarkdown(
    o: {
      input: string;
      book?: string;
      chapters?: Record<string, string>;
    },
  ) {
    const { input } = o;

    if (typeof input !== "string") {
      console.error("input", input);
      throw new Error("transformMarkdown - passed wrong type of input");
    }

    // https://github.com/markedjs/marked/issues/545
    const tableOfContents: {
      slug: string;
      level: number;
      text: string;
      raw: string;
    }[] = [];

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

          return '<pre><code class="' +
            // @ts-ignore How to type this?
            (this.options.langPrefix || "") +
            lang +
            '">' +
            code +
            "</code></pre>\n";
        },
        em(text: string) {
          const chapters = o?.chapters || {};
          const match = chapters[text];

          if (match) {
            return renderSync({
              htmlInput: `<SiteLink href="${match}">${text}</SiteLink>`,
            });
          }

          return text;
        },
        heading(
          text: string,
          level: number,
          raw: string,
        ) {
          const slug = slugify(raw);

          if (level > 1) {
            tableOfContents.push({
              slug,
              level,
              text,
              raw: smartypants(raw, 2),
            });
          }

          return renderSync({
            htmlInput: `<HeadingWithAnchor anchor="${slug}" level="${level}">
              ${text}
            </HeadingWithAnchor>`,
          });
        },
        image(src: string, title: string, text: string) {
          const textParts = text ? text.split("|") : [];
          const alt = textParts[0] || "";
          const width = textParts[1] || "";
          const height = textParts[2] || "";
          const className = textParts[3] || "";

          if (!src.startsWith("http")) {
            // Rewrite book image urls
            if (o?.book) {
              if (src.startsWith("images/")) {
                src = "/images/" + o.book + "/" +
                  src.replace(/^(images\/)/, "");
              }
            } else {
              // Rewrite blog urls to look from root
              if (src.startsWith("assets/")) {
                src = `/${src}`;
              }

              if (env.IMAGES_ROOT) {
                src = urlJoin(env.IMAGES_ROOT, src);
              }
            }
          }

          return `<figure class="not-prose my-0 flex flex-col gap-2 ${
            className ? "" : "w-screen md:w-full -ml-4 md:ml-0"
          } ${className}">
            <img class="${
            className === "author" ? "" : "border"
          }" src="${src}" loading="lazy" alt="${alt}" title="${
            title || ""
          }" width="${width}" height="${height}" />
            ${
            className === "author"
              ? ""
              : `<figcaption class="text-center text-sm">${alt}</figcaption>`
          }
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

          return renderSync({
            htmlInput: `<SiteLink href="${href}" title="${
              title || ""
            }">${text}</SiteLink>`,
          });
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

    return { content: marked(input.replace(/-# /g, "# ")), tableOfContents };
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
      match,
      `<div class="inline-block rounded-full bg-${
        className === "tip" ? "muted" : "warning"
      } text-white w-8 h-8 -ml-9 text-center">${textIcon}</div>`,
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
