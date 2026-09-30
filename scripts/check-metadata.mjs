import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";

const files = await readdir("build", { recursive: true });
const titles = new Set();
const canonicalUrls = new Set();
let count = 0;
for (const file of files.filter(
  (f) => f.endsWith(".html") && !f.startsWith("google")
)) {
  const html = await readFile(path.join("build", file), "utf8");
  const head = html.split("</head>")[0];
  const title = head.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title?.trim(), `${file}: missing title`);
  assert.ok(!titles.has(title), `${file}: duplicate title ${title}`);
  titles.add(title);
  const metas = Object.fromEntries(
    [
      ...head.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g),
    ].map((m) => [m[1], m[2]])
  );
  for (const field of [
    "description",
    "og:title",
    "og:description",
    "og:url",
    "og:image",
    "og:image:alt",
    "twitter:card",
    "twitter:image",
  ]) {
    assert.ok(metas[field]?.trim(), `${file}: missing ${field}`);
  }
  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const expectedPath =
    file === "index.html" ? "/" : `/${file.replace(/index\.html$/, "")}`;
  assert.equal(
    canonical,
    `https://survivejs.com${expectedPath}`,
    `${file}: incorrect canonical`
  );
  assert.equal(metas["og:url"], canonical);
  const graph = JSON.parse(
    head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1]
  );
  assert.equal(graph["@graph"][0].url, canonical);
  if (file === "404.html") assert.match(metas.robots, /noindex/);
  else canonicalUrls.add(canonical);
  const image = new URL(metas["og:image"]);
  assert.equal(image.origin, "https://survivejs.com");
  await access(path.join("build", image.pathname));
  count++;
}
const sitemap = await readFile("build/sitemap.xml", "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (m) => m[1]
);
assert.equal(
  new Set(sitemapUrls).size,
  sitemapUrls.length,
  "Duplicate sitemap URLs"
);
assert.deepEqual(
  new Set(sitemapUrls),
  canonicalUrls,
  "Sitemap must contain precisely the indexable canonical pages"
);
console.log(
  `Metadata verified on ${count} pages; ${canonicalUrls.size} canonical sitemap entries.`
);
