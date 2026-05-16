/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const SITE_URL = "https://survivejs.com";
const BOOKS = ["webpack", "react", "maintenance"];
const ALLOWED_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "site-612.pages.dev",
  "survivejs.com",
  "survivejs.stfi.re",
  "www.survivejs.com",
]);
const TARGET_ALIASES = new Map([
  [
    "/books/webpack/developing/automatic-browser-refresh/",
    "/books/webpack/developing/development-server/",
  ],
  [
    "/books/webpack/building/splitting-bundles/",
    "/books/webpack/building/bundle-splitting/",
  ],
  ["/books/webpack/optimizing-build/", "/books/webpack/optimizing/"],
  ["/books/webpack/packages/", "/books/webpack/techniques/consuming/"],
  [
    "/books/webpack/packages/consuming/",
    "/books/webpack/techniques/consuming/",
  ],
  [
    "/books/webpack/packages/consuming-techniques/",
    "/books/webpack/techniques/consuming/",
  ],
  ["/books/webpack/packages/authoring/", "/books/maintenance/packaging/"],
  [
    "/books/webpack/packages/authoring-techniques/",
    "/books/maintenance/packaging/",
  ],
  [
    "/books/webpack/packaging/standalone-builds/",
    "/books/maintenance/packaging/standalone-builds/",
  ],
  [
    "/books/webpack/appendices/customizing-eslint/",
    "/books/maintenance/appendices/customizing-eslint/",
  ],
]);
const DEFAULT_EXPORT = path.resolve(
  __dirname,
  "../../site-disqus/survivejs-2026-05-16T09_44_20.025877-all.xml",
);
const REDIRECTS_PATH = path.resolve(__dirname, "../assets/_redirects");
const BOOKS_PATH = path.resolve(__dirname, "../books");

const inputPath = path.resolve(process.argv[2] || DEFAULT_EXPORT);
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : "";

if (!fs.existsSync(inputPath)) {
  console.error(`Disqus export not found: ${inputPath}`);
  console.error(
    "Usage: node utils/generate-disqus-rewrites.js [export.xml] [output.csv]",
  );
  process.exit(1);
}

const redirects = readRedirects(REDIRECTS_PATH);
const currentBookPaths = readCurrentBookPaths(BOOKS_PATH);
const threads = readDisqusThreads(inputPath);
const rows = [];
const seen = new Set();

for (const thread of threads) {
  const target = resolveTarget(thread.link, redirects, currentBookPaths);

  if (!target || urlsMatch(thread.link, target)) {
    continue;
  }

  const key = `${thread.link}\n${target}`;

  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  rows.push([thread.link, target]);
}

rows.sort((a, b) => a[0].localeCompare(b[0]));

const output = rows.map((row) => row.map(toCsvCell).join(",")).join("\n") +
  (rows.length ? "\n" : "");

if (outputPath) {
  fs.writeFileSync(outputPath, output);
} else {
  process.stdout.write(output);
}

console.error(
  `Generated ${rows.length} Disqus URL mapper rows from ${threads.length} threads.`,
);

function readDisqusThreads(filePath) {
  const xml = fs.readFileSync(filePath, "utf8");
  const threads = [];

  for (const match of xml.matchAll(/<thread\b[\s\S]*?<\/thread>/g)) {
    const threadXml = match[0];
    const link = readTag(threadXml, "link");

    if (link) {
      threads.push({ link });
    }
  }

  return threads;
}

function readTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));

  return match ? decodeXml(match[1].trim()) : "";
}

function readRedirects(filePath) {
  const redirects = [];

  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [from, to] = trimmed.split(/\s+/);

    if (!from || !to) {
      continue;
    }

    redirects.push({
      from: normalizePath(from),
      to: normalizeTarget(to),
      wildcard: from.endsWith("/*"),
    });
  }

  redirects.sort((a, b) => Number(a.wildcard) - Number(b.wildcard));

  return redirects;
}

function readCurrentBookPaths(root) {
  const paths = new Set();

  for (const book of BOOKS) {
    const bookRoot = path.join(root, `${book}-book/manuscript`);
    const bookFile = path.join(bookRoot, "Book.txt");

    if (!fs.existsSync(bookFile)) {
      continue;
    }

    paths.add(`/books/${book}/`);

    for (const line of fs.readFileSync(bookFile, "utf8").split("\n")) {
      const name = line.trim();

      if (!name.endsWith(".md")) {
        continue;
      }

      paths.add(`/books/${book}/${cleanChapterName(name)}/`);
    }
  }

  return paths;
}

function resolveTarget(rawUrl, redirects, currentBookPaths) {
  const parsed = parseThreadUrl(rawUrl);

  if (!parsed || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return "";
  }

  const pathname = normalizePath(parsed.pathname);

  if (!pathname) {
    return "";
  }

  const redirectTarget = normalizeLegacyTarget(
    applyRedirects(pathname, redirects),
  );

  if (currentBookPaths.has(redirectTarget)) {
    return toSiteUrl(redirectTarget);
  }

  const inferredTarget = normalizeLegacyTarget(
    inferBookTarget(pathname, currentBookPaths),
  );

  if (currentBookPaths.has(inferredTarget)) {
    return toSiteUrl(inferredTarget);
  }

  return "";
}

function parseThreadUrl(rawUrl) {
  const cleaned = rawUrl.replace(/^http:\/\/https:\/\//, "https://");

  try {
    return new URL(cleaned);
  } catch (_) {
    return null;
  }
}

function applyRedirects(pathname, redirects) {
  for (const redirect of redirects) {
    if (redirect.wildcard) {
      const prefix = redirect.from.slice(0, -"/*".length);

      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        const splat = pathname.slice(prefix.length).replace(/^\//, "");

        return normalizeTarget(redirect.to.replace(":splat", splat));
      }

      continue;
    }

    if (pathname === redirect.from) {
      return redirect.to;
    }
  }

  return pathname;
}

function inferBookTarget(pathname, currentBookPaths) {
  const parts = pathname.split("/").filter(Boolean);
  const book = parts[0];

  if (!BOOKS.includes(book)) {
    return "";
  }

  const candidate = normalizePath(`/books/${parts.join("/")}`);

  return currentBookPaths.has(candidate) ? candidate : "";
}

function normalizeLegacyTarget(pathname) {
  if (!pathname) {
    return "";
  }

  let ret = normalizePath(pathname);

  while (TARGET_ALIASES.has(ret)) {
    ret = TARGET_ALIASES.get(ret);
  }

  return ret;
}

function normalizeTarget(target) {
  if (target.startsWith("http")) {
    try {
      const url = new URL(target);

      return normalizePath(url.pathname);
    } catch (_) {
      return target;
    }
  }

  return normalizePath(target);
}

function normalizePath(value) {
  const withoutQuery = value.split(/[?#]/)[0];
  const pathOnly = withoutQuery.endsWith("/index.html")
    ? withoutQuery.slice(0, -"index.html".length)
    : withoutQuery;

  if (pathOnly === "/") {
    return "/";
  }

  return `/${pathOnly.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

function toSiteUrl(pathname) {
  return `${SITE_URL}${normalizePath(pathname)}`;
}

function urlsMatch(left, right) {
  const parsedLeft = parseThreadUrl(left);
  const parsedRight = parseThreadUrl(right);

  return parsedLeft && parsedRight &&
    normalizePath(parsedLeft.pathname) === normalizePath(parsedRight.pathname) &&
    parsedLeft.hostname.replace(/^www\./, "") ===
      parsedRight.hostname.replace(/^www\./, "");
}

function cleanChapterName(filePath) {
  const parts = filePath.split("/");
  const beginning = parts.slice(0, -1);
  const end = trimStart(parts.at(-1), "0123456789-_");

  return beginning.concat(end).join("/").toLowerCase()
    .replace(/ /g, "-")
    .replace(/_/g, "-")
    .split(".")
    .slice(0, -1)
    .join(".");
}

function trimStart(value, chars) {
  let ret = value;

  while (ret && chars.includes(ret[0])) {
    ret = ret.slice(1);
  }

  return ret;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function toCsvCell(value) {
  return `"${value.replace(/"/g, '""')}"`;
}
