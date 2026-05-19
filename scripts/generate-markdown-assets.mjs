import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const books = [
  {
    source: "books/webpack-book/manuscript",
    target: "build/books/webpack",
  },
  {
    source: "books/react-book/manuscript",
    target: "build/books/react",
  },
  {
    source: "books/maintenance-book/manuscript",
    target: "build/books/maintenance",
  },
];

await generateBlogMarkdown();
await generateBookMarkdown();

async function generateBlogMarkdown() {
  for (const entry of await readdir("pages/blog", { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const sourcePath = `pages/blog/${entry.name}`;
    const source = await readFile(sourcePath, "utf8");
    const { frontmatter, body } = splitFrontmatter(source);
    const metadata = parseBlogFrontmatter(frontmatter);
    const slug = cleanSlug(entry.name);
    const content = formatBlogMarkdown(metadata, body);

    await writeMarkdown(`build/blog/${slug}/index.md`, content);
  }
}

async function generateBookMarkdown() {
  for (const book of books) {
    const chapterPaths = (await readFile(`${book.source}/Book.txt`, "utf8"))
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith(".md"));

    for (const chapterPath of chapterPaths) {
      const sourcePath = `${book.source}/${chapterPath}`;
      const content = await readFile(sourcePath, "utf8");
      const slug = cleanChapterName(chapterPath);

      await writeMarkdown(`${book.target}/${slug}/index.md`, content);
    }
  }
}

function splitFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return { frontmatter: "", body: source };
  }

  const end = source.indexOf("\n---", 4);

  if (end === -1) {
    return { frontmatter: "", body: source };
  }

  return {
    frontmatter: source.slice(4, end).trim(),
    body: source.slice(end + 4).trimStart(),
  };
}

function parseBlogFrontmatter(frontmatter) {
  return Object.fromEntries(
    frontmatter
      .split("\n")
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^"|"$/g, "")]),
  );
}

function formatBlogMarkdown(metadata, body) {
  const header = [
    metadata.title ? `# ${metadata.title}` : "",
    metadata.date ? `Published: ${metadata.date}` : "",
    metadata.keywords ? `Keywords: ${metadata.keywords}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return header ? `${header}\n\n${body}` : body;
}

async function writeMarkdown(targetPath, content) {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${content.trim()}\n`);
}

function cleanSlug(resourcePath) {
  const parts = resourcePath.split("/");

  return trimStart(parts[parts.length - 1] || "", "0123456789-_")
    .split(".")[0]
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("_", "-");
}

function cleanChapterName(resourcePath) {
  const parts = resourcePath.split("/");
  const beginning = parts.slice(0, -1);
  const end = trimStart(parts[parts.length - 1] || "", "0123456789-_");

  return beginning
    .concat(end)
    .join("/")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("_", "-")
    .split(".")
    .slice(0, -1)
    .join(".");
}

function trimStart(value, chars) {
  let index = 0;

  while (index < value.length && chars.includes(value[index])) {
    index += 1;
  }

  return value.slice(index);
}
