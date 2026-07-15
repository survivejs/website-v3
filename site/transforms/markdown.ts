import { defineHastPlugin, defineMdastPlugin, markdownToHtml } from "satteri";
import { toHtml } from "hast-util-to-html";
import type { Element, Root } from "hast";
import type { DataSourcesApi } from "gustwind";
import { highlight } from "./utilities/highlight.ts";
import { getEnv } from "../utilities/getEnv.ts";
import { urlJoin } from "../utilities/urlJoin.ts";

type MarkdownOptions = {
  input: string;
  book?: string;
  chapters?: Record<string, string>;
};

type TableOfContentsEntry = {
  slug: string;
  level: number;
  text: string;
  raw: string;
};

type HeadingAnchor = Pick<TableOfContentsEntry, "slug">;

function getTransformMarkdown({ load, renderSync }: DataSourcesApi) {
  return function transformMarkdown(options: MarkdownOptions) {
    const { input } = options;

    if (typeof input !== "string") {
      console.error("input", input);
      throw new Error("transformMarkdown - passed wrong type of input");
    }

    const tableOfContents: TableOfContentsEntry[] = [];
    const headingAnchors: HeadingAnchor[] = [];
    const result = markdownToHtml(input.replace(/-# /g, "# "), {
      features: {
        frontmatter: false,
        gfm: true,
        smartPunctuation: true,
      },
      mdastPlugins: [
        createSurviveJsMdastPlugin({
          headingAnchors,
          load,
          options,
          tableOfContents,
        }),
      ],
      hastPlugins: [
        createSurviveJsHastPlugin({ headingAnchors, options, renderSync }),
      ],
    });

    return { content: result.html, tableOfContents };
  };
}

function createSurviveJsMdastPlugin({
  headingAnchors,
  load,
  options,
  tableOfContents,
}: Pick<DataSourcesApi, "load"> & {
  headingAnchors: HeadingAnchor[];
  options: MarkdownOptions;
  tableOfContents: TableOfContentsEntry[];
}) {
  return defineMdastPlugin({
    name: "survivejs-markdown-mdast",
    heading(node, ctx) {
      const text = ctx.textContent(node);
      const slug = slugify(text);

      headingAnchors.push({ slug });

      if (node.depth > 1) {
        tableOfContents.push({
          slug,
          level: node.depth,
          text,
          raw: text,
        });
      }
    },
    paragraph(node, ctx) {
      const text = ctx.textContent(node);

      if (text === "{pagebreak}") {
        ctx.removeNode(node);
        return;
      }

      const [firstChild] = node.children;

      if (firstChild?.type !== "text") {
        return;
      }

      const customQuote = getCustomQuote(firstChild.value);

      if (customQuote) {
        ctx.replaceNode(firstChild, {
          rawHtml: renderCustomQuoteIcon(customQuote.type) + customQuote.text,
        });
      }
    },
    image(node, ctx) {
      ctx.replaceNode(node, {
        rawHtml: renderImage({
          altText: node.alt || "",
          book: options.book,
          source: node.url,
          title: node.title || "",
        }),
      });
    },
    link(node, ctx) {
      if (ctx.textContent(node) !== "<file>") {
        return;
      }

      const fileContents = load.textFileSync(node.url);

      ctx.replaceNode(node, {
        rawHtml: renderCodeBlock({
          code: fileContents,
          language: node.url.split(".").at(-1),
        }),
      });
    },
  });
}

function createSurviveJsHastPlugin({
  headingAnchors,
  options,
  renderSync,
}: Pick<DataSourcesApi, "renderSync"> & {
  headingAnchors: HeadingAnchor[];
  options: MarkdownOptions;
}) {
  let headingIndex = 0;

  return defineHastPlugin({
    name: "survivejs-markdown-hast",
    element: [
      {
        filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
        visit(node, ctx) {
          const slug =
            headingAnchors[headingIndex++]?.slug ||
            slugify(ctx.textContent(node));

          ctx.setProperty(node, "id", slug);
          ctx.setProperty(node, "class", "scroll-mt-16");
          ctx.appendChild(node, {
            type: "element",
            tagName: "a",
            properties: {
              class:
                "ml-2 no-underline text-md md:text-sm align-middle text-gray hover:text-black print:hidden",
              href: `#${slug}`,
            },
            children: [{ type: "text", value: "#" }],
          });
        },
      },
      {
        filter: ["em"],
        visit(node, ctx) {
          const text = ctx.textContent(node);
          const chapterHref = options.chapters?.[text];

          if (!chapterHref) {
            return;
          }

          const children = toHtml({
            type: "root",
            children: [...node.children],
          } satisfies Root);

          ctx.replaceNode(node, {
            type: "raw",
            value: renderSync({
              htmlInput: `<SiteLink href="${escapeAttribute(
                chapterHref
              )}">${children}</SiteLink>`,
            }),
          });
        },
      },
      {
        filter: ["a"],
        visit(node, ctx) {
          const href = getStringProperty(node, "href");

          if (!href) {
            return;
          }

          const title = getStringProperty(node, "title");
          const children = toHtml({
            type: "root",
            children: [...node.children],
          } satisfies Root);

          ctx.replaceNode(node, {
            type: "raw",
            value: renderSync({
              htmlInput: `<SiteLink href="${escapeAttribute(href)}" title="${escapeAttribute(
                title || ""
              )}">${children}</SiteLink>`,
            }),
          });
        },
      },
      {
        filter: ["ul"],
        visit(node, ctx) {
          ctx.setProperty(node, "class", "list-disc list-inside");
        },
      },
      {
        filter: ["ol"],
        visit(node, ctx) {
          ctx.setProperty(node, "class", "list-decimal list-inside");
        },
      },
      {
        filter: ["pre"],
        visit(node, ctx) {
          const code = node.children.find(isCodeElement);

          if (!code) {
            return;
          }

          ctx.replaceNode(
            node,
            renderCodeElement({
              code: ctx.textContent(code),
              language: getCodeLanguage(code),
            })
          );
        },
      },
    ],
  });
}

function getCustomQuote(value: string) {
  if (value.startsWith("T>")) {
    return { type: "tip" as const, text: value.slice(2) };
  }

  if (value.startsWith("W>")) {
    return { type: "warning" as const, text: value.slice(2) };
  }
}

function renderCustomQuoteIcon(type: "tip" | "warning") {
  const background = type === "tip" ? "muted" : "warning";
  const icon = type === "tip" ? "!" : "?";

  return `<div class="inline-block rounded-full bg-${background} text-white w-8 h-8 -ml-9 text-center">${icon}</div>`;
}

function renderImage({
  altText,
  book,
  source,
  title,
}: {
  altText: string;
  book?: string;
  source: string;
  title: string;
}) {
  const [alt = "", width = "", height = "", className = ""] =
    altText.split("|");
  let src = source.replace(/"$/, "");

  if (!src.startsWith("http")) {
    if (book && src.startsWith("images/")) {
      src = `/images/${book}/${src.replace(/^(images\/)/, "")}`;
    } else if (!book) {
      if (src.startsWith("assets/")) {
        src = `/${src}`;
      }

      const imagesRoot = getEnv("IMAGES_ROOT");

      if (imagesRoot) {
        src = urlJoin(imagesRoot, src);
      }
    }
  }

  const escapedAlt = escapeAttribute(alt);
  const escapedClassName = escapeAttribute(className);
  const isAuthor = className === "author";

  return `<figure class="not-prose my-0 flex flex-col gap-2 ${
    className ? "" : "w-screen md:w-full -ml-4 md:ml-0"
  } ${escapedClassName}">
    <img class="${isAuthor ? "" : "border"}" src="${escapeAttribute(
      src
    )}" loading="lazy" alt="${escapedAlt}" title="${escapeAttribute(
      title
    )}" width="${escapeAttribute(width)}" height="${escapeAttribute(height)}" />
    ${
      isAuthor
        ? ""
        : `<figcaption class="text-center text-sm">${escapeHtml(alt)}</figcaption>`
    }
  </figure>`;
}

function isCodeElement(node: Element["children"][number]): node is Element {
  return node.type === "element" && node.tagName === "code";
}

function getCodeLanguage(code: Readonly<Element>) {
  const className = code.properties?.className ?? code.properties?.class;
  const classes = Array.isArray(className) ? className : [className];
  const languageClass = classes.find(
    (value): value is string =>
      typeof value === "string" && value.startsWith("language-")
  );

  return languageClass?.slice("language-".length);
}

function renderCodeElement({
  code,
  language,
}: {
  code: string;
  language?: string;
}): Element {
  return {
    type: "element",
    tagName: "pre",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "code",
        properties: language ? { class: language } : {},
        children: [
          {
            type: "raw",
            value: highlightCode(code, language),
          },
        ],
      },
    ],
  };
}

function renderCodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return `<pre><code${language ? ` class="${escapeAttribute(language)}"` : ""}>${highlightCode(
    code,
    language
  )}</code></pre>\n`;
}

function highlightCode(code: string, language?: string) {
  return (
    (highlight(code, language) || escapeHtml(code)).replace(/\n$/, "") + "\n"
  );
}

function getStringProperty(node: Readonly<Element>, key: string) {
  const value = node.properties[key];

  return typeof value === "string" ? value : undefined;
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(idBase: string) {
  return idBase
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w]+/g, "-");
}

export default getTransformMarkdown;
