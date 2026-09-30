import assert from "node:assert/strict";
import test from "node:test";
import { canonicalUrl, renderMetadata } from "./metadata.ts";
import { renderAtomFeed } from "../layouts/rssPage.server.ts";
const meta = {
  url: "https://survivejs.com",
  title: "Research",
  description: "Research & practice",
  siteName: "SurviveJS",
  language: "en",
  built: "2026-09-30",
};
const graph = (html: string) =>
  JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]
  )["@graph"];

test("canonical URLs remove query/hash and agree with sitemap paths", () => {
  assert.equal(
    canonicalUrl(meta.url, "/research?q=x#papers"),
    "https://survivejs.com/research/"
  );
  assert.equal(canonicalUrl(meta.url, "/"), "https://survivejs.com/");
  assert.equal(
    canonicalUrl(meta.url, "/404.html"),
    "https://survivejs.com/404.html"
  );
  assert.equal(
    canonicalUrl(meta.url, "/404.html/"),
    "https://survivejs.com/404.html"
  );
});
test("metadata safely escapes text and JSON-LD", () => {
  const html = renderMetadata({
    meta: {
      ...meta,
      title: 'A "quoted" & title',
      description: '</script><script>alert("x")</script>',
    },
    url: "/research/",
  });
  assert.match(html, /A &quot;quoted&quot; &amp; title/);
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.equal(graph(html)[0].description, 'alert("x")');
});
test("article metadata uses source dates and a linked author", () => {
  const html = renderMetadata({
    meta,
    url: "/blog/example/",
    document: {
      data: { title: "Example", date: "2020-02-03", updateDate: "2021-04-05" },
    },
  });
  const article = graph(html)[0];
  assert.equal(article["@type"], "BlogPosting");
  assert.equal(article.dateModified, "2021-04-05T00:00:00.000Z");
  assert.equal(article.author.url, "https://survivejs.com/about-me/");
  assert.ok(!html.includes(meta.built));
});
test("book dates use Git evidence and are omitted when unavailable", () => {
  const context = {
    meta,
    url: "/books/webpack/introduction/",
    document: {
      book: "webpack",
      data: { title: "Introduction" },
      sourceUpdate: { date: "2023-07-04" },
    },
  };
  assert.equal(graph(renderMetadata(context))[0].dateModified, "2023-07-04");
  assert.match(renderMetadata(context), /Introduction – Webpack – SurviveJS/);
  assert.equal(
    graph(renderMetadata({ ...context, document: {} }))[0].dateModified,
    undefined
  );
});
test("404 is noindex and missing metadata fails the build", () => {
  assert.match(
    renderMetadata({ meta, url: "/404.html" }),
    /name="robots" content="noindex, follow"/
  );
  assert.throws(
    () =>
      renderMetadata({ meta: { ...meta, description: "" }, url: "/research/" }),
    /Missing metadata/
  );
});
test("Atom uses absolute IDs, XML escaping, authors and content update dates", () => {
  const xml = renderAtomFeed({
    meta,
    blogPosts: [
      {
        data: {
          title: "A & B",
          slug: "example",
          date: "2020-02-03",
          updateDate: "2021-04-05",
          description: "<example>",
        },
      },
    ],
  });
  assert.match(xml, /<id>https:\/\/survivejs.com\/blog\/example\/<\/id>/);
  assert.match(xml, /A &amp; B/);
  assert.match(xml, /&lt;example&gt;/);
  assert.match(xml, /<updated>2021-04-05T00:00:00.000Z<\/updated>/);
  assert.ok(!xml.includes(meta.built));
});
