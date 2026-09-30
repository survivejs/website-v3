import { canonicalUrl, escapeHtml, isoDate } from "../utilities/metadata.ts";

export function renderAtomFeed({ meta, blogPosts }: any) {
  const updated = blogPosts
    .map(({ data }: any) => isoDate(data.updateDate || data.date))
    .filter(Boolean)
    .sort()
    .at(-1);
  const root = canonicalUrl(meta.url, "/");
  const entries = blogPosts.map(({ data }: any) => {
    const url = canonicalUrl(meta.url, `/blog/${data.slug}/`);
    return `<entry>
      <title>${escapeHtml(data.title)}</title>
      <id>${escapeHtml(url)}</id>
      <link rel="alternate" type="text/html" href="${escapeHtml(url)}"/>
      <published>${isoDate(data.date)}</published>
      <updated>${isoDate(data.updateDate || data.date)}</updated>
      <author><name>${escapeHtml(data.author?.name || "Juho Vepsäläinen")}</name></author>
      <summary type="text">${escapeHtml(data.description)}</summary>
    </entry>`;
  });
  return `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
      <title>${escapeHtml(meta.siteName)}</title><id>${escapeHtml(root)}</id>
      <link rel="alternate" href="${escapeHtml(root)}"/>
      <link rel="self" type="application/atom+xml" href="${escapeHtml(new URL("atom.xml", root).href)}"/>
      <updated>${updated}</updated>${entries.join("\n")}
    </feed>`;
}
export function init() {
  return {
    atomFeed(this: { context: any }) {
      return renderAtomFeed(this.context);
    },
  };
}
