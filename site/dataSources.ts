import {
  extract,
  test,
} from "https://deno.land/std@0.207.0/front_matter/yaml.ts";
import path from "node:path";
import { parse } from "https://deno.land/std@0.207.0/yaml/parse.ts";
import removeMarkdown from "https://esm.sh/remove-markdown@0.5.0";
import getMarkdown from "./transforms/markdown.ts";
import { urlJoin } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";
import { getMemo } from "https://deno.land/x/gustwind@v0.66.3/utilities/getMemo.ts";
import trimStart from "https://deno.land/x/lodash@4.17.15-es/trimStart.js";
import type { DataSourcesApi } from "https://deno.land/x/gustwind@v0.71.2/types.ts";

type MarkdownWithFrontmatter = {
  data: {
    // In this project, slug is derived from path automatically
    slug: string;
    title: string;
    date: Date;
    updateDate?: Date;
    author?: Author;
    editors?: Author[];
    description?: string;
    preview?: string;
    keywords: string[];
  };
  content: string;
};

type Author = { name: string; twitter: string };

type Topic = {
  title: string;
  posts: MarkdownWithFrontmatter[];
  slug: string;
};

function init({ load, render, renderSync }: DataSourcesApi) {
  const markdownToHtml = getMarkdown({ load, render, renderSync });

  function getBookDescription(book: "maintenance" | "react" | "webpack") {
    switch (book) {
      case "maintenance":
        return "The maintenance book captures good practices related to developing and maintaining JavaScript applications or packages at scale. I co-authored the book with [Artem Sapegin](https://sapegin.me/) and the book is not yet fully complete although completion and a bigger update is planned.";
      case "react":
        return "[React](https://react.dev/) is a popular library for developing JavaScript applications and websites. In this book, you will implement a simple Kanban application step-wise. Note that the book is still using old class-based syntax and needs an update to the latest. You can follow the book with the help of the official documentation for now, however.";
      case "webpack":
        return `[Webpack](https://webpack.js.org/) is a module bundler meant for building JavaScript applications and sites. In this book, I will go through main features of webpack while teaching you to compose configuration using [webpack-merge](https://www.npmjs.com/package/webpack-merge).

Incidentally, I developed webpack-merge for the purposes of this book and since then it has become a popular solution for taming the complexity of webpack configuration. The book is meant to web developers ranging from beginners to advanced although you should be familiar with the basic ideas behind JavaScript language to get most out of it.

The book content was developed during many years with the help of the community and it complements the official documentation. Even if you know webpack well already, I have taken care to include short summaries capturing the main points of the book so you can fill the gaps in your knowledge and understanding of the tool.`;
    }
  }

  async function indexBook(directory: string, slugPrefix: string) {
    const chapters = Object.fromEntries((await indexMarkdown(directory, {
      parseHeadmatter: true,
      recursive: true,
    })).map((c) => {
      const { title, body } = parseTitle(c.content || "");

      return [c.name, {
        ...c,
        data: {
          slug: cleanChapterName(c.name),
          title,
          description: generatePreview(body, 300),
        },
      }];
    }));
    const chapterOrder = (await load.textFile(path.join(directory, "Book.txt")))
      .split("\n").filter((n) => path.extname(n) === ".md");

    return generateAdjacent(chapterOrder.map((name) => chapters[name]), {
      invert: true,
      slugPrefix,
    });
  }

  async function indexBlog(
    directory: string,
    o?: { amount?: number; charactersPerDescription?: number },
  ) {
    const blogFiles =
      (await indexMarkdown(directory, { parseHeadmatter: true })).map((p) => ({
        ...p,
        // @ts-expect-error This is fine for now (inaccurate type)
        data: resolveBlogPost(p.path, p, o?.charactersPerDescription),
      }));

    return generateAdjacent(
      blogFiles.toSorted((a, b) => getIndex(b.name) - getIndex(a.name)).slice(
        0,
        o?.amount,
      ),
      { invert: false, slugPrefix: "/blog/" },
    );
  }

  async function indexTopics(directory: string): Promise<Topic[]> {
    const blogFiles = await indexMarkdown(directory, { parseHeadmatter: true });
    const keywords: Record<string, MarkdownWithFrontmatter[]> = {};

    await Promise.all(blogFiles.map(async ({ path }) => {
      const p = await parseHeadmatter(path);

      p.data.keywords?.forEach((keyword: string) => {
        // Spaces to -
        keyword = keyword.replace(" ", "-");

        if (keywords[keyword]) {
          // @ts-expect-error This is fine for now
          keywords[keyword].push({ ...p, data: resolveBlogPost(path, p) });
        } else {
          // @ts-expect-error This is fine for now
          keywords[keyword] = [{ ...p, data: resolveBlogPost(path, p) }];
        }
      });
    }));

    const keywordsArray = Object.keys(keywords);

    keywordsArray.sort();

    return keywordsArray.map((topic) => ({
      title: resolveKeywordToTitle(topic),
      description: topic, // TODO: This could be more accurate
      posts: keywords[topic].toSorted((a, b) =>
        b.data.date.getTime() - a.data.date.getTime()
      ),
      slug: cleanSlug(topic),
    }));
  }

  function processTopic(t: Topic) {
    return t;
  }

  async function indexMarkdown(
    directory: string,
    o: { parseHeadmatter: boolean; recursive?: boolean },
  ) {
    const files = await load.dir({
      path: directory,
      extension: ".md",
      type: "",
      recursive: o.recursive,
    });

    return Promise.all(
      files.map(async ({ path, name }) => ({
        ...(o.parseHeadmatter ? await parseHeadmatter(path) : {}),
        path,
        name,
      })),
    );
  }

  function getIndex(str: string) {
    return parseInt(str.split("-")[0], 10);
  }

  function generateAdjacent(
    pages: unknown[],
    o: { invert: boolean; slugPrefix: string },
  ) {
    return pages.map((page, i) => {
      // Avoid mutation
      const ret = structuredClone(page);
      const next = i > 0 && pages[i - 1];
      const previous = i < pages.length - 1 && pages[i + 1];

      // @ts-expect-error This is fine
      ret.next = o?.invert ? previous : next;
      // @ts-expect-error This is fine
      ret.previous = o?.invert ? next : previous;

      // @ts-expect-error This is fine
      if (ret.next) {
        // @ts-expect-error This is fine
        ret.next = {
          // @ts-expect-error This is fine
          ...ret.next,
          // @ts-expect-error This is fine
          data: { ...ret.next.data, slug: o.slugPrefix + ret.next.data.slug },
        };
      }

      // @ts-expect-error This is fine
      if (ret.previous) {
        // @ts-expect-error This is fine
        ret.previous = {
          // @ts-expect-error This is fine
          ...ret.previous,
          data: {
            // @ts-expect-error This is fine
            ...ret.previous.data,
            // @ts-expect-error This is fine
            slug: o.slugPrefix + ret.previous.data.slug,
          },
        };
      }

      return ret;
    });
  }

  async function processBlogPost({ path, previous, next }: {
    path: string;
    previous: MarkdownWithFrontmatter;
    next: MarkdownWithFrontmatter;
  }, o?: { parseHeadmatter: boolean; skipFirstLine: boolean }) {
    const d = await processMarkdown({ path, previous, next }, o);

    return {
      ...d,
      data: resolveBlogPost(path, d),
    };
  }

  function processChapter(
    { path, previous, next }: {
      path: string;
      previous: MarkdownWithFrontmatter;
      next: MarkdownWithFrontmatter;
    },
    book: string,
  ) {
    // @ts-expect-error This is fine
    const contextChapters = this.parentDataSources.chapters;
    let chapters = {};

    if (contextChapters) {
      chapters = Object.fromEntries(
        contextChapters.map((
          // @ts-expect-error This is fine
          c,
        ) => [c.data.title, urlJoin("..", c.data.slug, "/")]),
      );
    }

    return processMarkdown({ path, previous, next }, {
      parseHeadmatter: false,
    }, { book, chapters });
  }

  async function processMarkdown(
    { path, previous, next }: {
      path: string;
      previous: MarkdownWithFrontmatter;
      next: MarkdownWithFrontmatter;
    },
    o?: { parseHeadmatter?: boolean; skipFirstLine?: boolean },
    rest?: Record<string, unknown>,
  ) {
    if (o?.parseHeadmatter) {
      const headmatter = await parseHeadmatter(path);

      return {
        previous,
        next,
        ...headmatter,
        ...(await parseMarkdown(headmatter.content)),
      };
    }

    return {
      previous,
      next,
      ...(await parseMarkdown(await load.textFile(path), o, rest)),
    };
  }

  async function parseHeadmatter(
    path: string,
  ): Promise<
    MarkdownWithFrontmatter | { data: { keywords: string[] }; content: string }
  > {
    const file = await load.textFile(path);

    if (test(file)) {
      const { frontMatter, body: content } = extract(file);
      const slug = cleanSlug(path);

      return {
        // TODO: It would be better to handle this with Zod or some other runtime checker
        data: {
          ...parse(frontMatter) as MarkdownWithFrontmatter["data"],
          slug,
        },
        content,
      };
    }

    // TODO: Likely it would be better to extract this branch
    return {
      data: { keywords: [] },
      content: file,
    };

    // throw new Error(`path ${path} did not contain a headmatter`);
  }

  // Interestingly enough caching to fs doesn't result in a speedup
  // TODO: Investigate why not
  // const fs = await fsCache(path.join(Deno.cwd(), ".gustwind"));
  const memo = getMemo(new Map());
  function parseMarkdown(
    lines: string,
    o?: { skipFirstLine?: boolean },
    rest?: Record<string, unknown>,
  ) {
    const input = o?.skipFirstLine
      ? lines.split("\n").slice(1).join("\n")
      : lines;

    return memo(markdownToHtml, { ...rest, input });
  }

  return {
    getBookDescription,
    indexBlog,
    indexBook,
    indexMarkdown,
    indexTopics,
    processBlogPost,
    processChapter,
    processMarkdown,
    processTopic,
  };
}

function resolveKeywordToTitle(keyword: string) {
  switch (keyword) {
    case "ajax":
      return "AJAX";
    case "api":
      return "API";
    case "baas":
      return "BaaS";
    case "ci":
      return "Continuous Integration";
    case "cli":
      return "Command Line Interface";
    case "cssinjs":
      return "css-in-js";
    case "ecommerce":
      return "E-commerce";
    case "json":
      return "JSON";
    case "react native":
      return "React Native";
    case "javascript":
      return "JavaScript";
    case "typescript":
      return "TypeScript";
    case "graphql":
      return "GraphQL";
    case "npm":
      return "npm";
    case "survivejs":
      return "SurviveJS";
    case "nodejs":
      return "NodeJS";
    case "rxjs":
      return "RxJS";
    case "reasonml":
      return "ReasonML";
    default:
      return (keyword[0].toUpperCase() + keyword.slice(1)).replace(/-/g, " ");
  }
}

function resolveBlogPost(
  path: string,
  p: MarkdownWithFrontmatter,
  charactersPerDescription?: number,
) {
  const preview = generatePreview(p.content, charactersPerDescription || 150);

  if (!p.data.date) {
    console.error(path);
    throw new Error("Blog post is missing a date");
  }

  return {
    ...p.data,
    description: p.data?.description || p.data?.preview || preview,
    // TODO
    images: {}, // resolveImages(p.data?.headerImage),
    slug: cleanSlug(path),
    preview,
    author: p.data?.author || {
      name: "Juho Vepsäläinen",
      // TODO: Rename this field to something like "url"
      twitter: "/about-me/",
    },
    editors: p.data?.editors?.map((handle) => ({
      // @ts-ignore This is fine since there's a transformation here
      // that's not caught by typing yet.
      name: handleToName(handle),
      twitter: `https://twitter.com/${handle}`,
    })),
    topics: p.data?.keywords?.map((keyword: string) => {
      return {
        title: resolveKeywordToTitle(keyword),
        slug: keyword.replace(" ", "-"),
      };
    }) || [],
  };
}

function handleToName(handle: string) {
  switch (handle) {
    case "bebraw":
      return "Juho Vepsäläinen";
    case "karlhorky":
      return "Karl Horky";
    default:
      break;
  }

  return "";
}

function cleanSlug(resourcePath: string) {
  const parts = resourcePath.split("/");
  const end =
    trimStart(parts.slice(-1)[0], "0123456789-_", undefined).split(".")[0];

  return end.toLowerCase()
    .replace(/ /g, "-")
    .replace(/_/g, "-");
}

// TODO
/*
function resolveImages(headerImage?: string) {
  if (!headerImage) {
    return { header: "", thumbnail: "" };
  }

  // @ts-expect-error Error is expected as headerImage isn't strict enough and
  // we validate it in runtime.
  const image = images[headerImage];
  if (!image) {
    throw new Error("Failed to find a matching image for " + headerImage);
  }

  return {
    header: config.meta.imagesEndpoint + `?image=${image}&type=public`,
    thumbnail: config.meta.imagesEndpoint + `?image=${image}&type=thumb`,
  };
}
*/

function generatePreview(content: string, amount: number) {
  return `${removeMarkdown(content).slice(0, amount)}…`;
}

function cleanChapterName(path: string) {
  const parts = path.split("/");
  const beginning = parts.slice(0, -1);
  const end = trimStart(parts.slice(-1)[0], "0123456789-_", undefined);

  return beginning
    .concat(end)
    .join("/")
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/_/g, "-")
    .split(".")
    .slice(0, -1)
    .join(".");
}

function parseTitle(body: string) {
  const lines = body.split("\n");

  if (lines[0].indexOf("#") === 0 && lines[0][1] === " ") {
    return {
      title: removeMarkdown(lines[0]),
      body: lines.slice(1).join("\n"),
    };
  }

  if (lines[0].indexOf("-#") === 0) {
    return {
      title: removeMarkdown(lines[0].slice(2).trim()),
      body: lines.slice(1).join("\n"),
    };
  }

  return { body };
}

export { init };
