import removeMarkdown from "remove-markdown";

export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const plain = (value: unknown) =>
  removeMarkdown(String(value ?? ""))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
export function canonicalUrl(base: string, pathname: string) {
  const url = new URL(pathname || "/", base);
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (!/\.[a-z0-9]+$/i.test(url.pathname))
    url.pathname = url.pathname.replace(/\/+$/, "") + "/";
  return url.href;
}
export function isoDate(value: unknown) {
  if (!value) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// Metadata uses source dates only: a rebuild does not mean content was revised.
export function renderMetadata(context: any) {
  const { meta, document = {} } = context;
  const data = document.data || {};
  const canonical = canonicalUrl(meta.url, context.url);
  const pathname = new URL(canonical).pathname;
  const article = pathname.startsWith("/blog/") && Boolean(data.date);
  const book = document.book;
  const bookNames: Record<string, string> = {
    webpack: "Webpack",
    react: "React",
    maintenance: "Maintenance",
  };
  const heading = plain(data.title || meta.title);
  const title = book
    ? `${heading} – ${bookNames[book]} – SurviveJS`
    : heading.includes("SurviveJS")
      ? heading
      : `${heading} – SurviveJS`;
  const description = plain(meta.description || data.description);
  if (!heading || !description)
    throw new Error(`Missing metadata for ${pathname}`);
  const image = new URL("/images/social.png", meta.url).href;
  const imageAlt =
    "SurviveJS — Web development research and practice by Juho Vepsäläinen";
  const published = article ? isoDate(data.date) : undefined;
  const modified = article
    ? isoDate(data.updateDate || data.date)
    : document.sourceUpdate?.date || context.sourceUpdate?.date;
  const person = {
    "@type": "Person",
    "@id": `${meta.url}/about-me/#person`,
    name: "Juho Vepsäläinen",
    url: `${meta.url}/about-me/`,
  };
  const author =
    data.author?.name && data.author.name !== person.name
      ? { "@type": "Person", name: data.author.name }
      : person;
  const page: Record<string, unknown> = {
    "@type": article
      ? "BlogPosting"
      : pathname === "/about-me/"
        ? "ProfilePage"
        : "WebPage",
    "@id": `${canonical}#page`,
    url: canonical,
    name: title,
    description,
    inLanguage: meta.language,
    isPartOf: { "@id": `${meta.url}/#website` },
    ...(modified ? { dateModified: modified } : {}),
    ...(article
      ? {
          headline: heading,
          datePublished: published,
          author,
          image,
          mainEntityOfPage: canonical,
        }
      : {}),
    ...(pathname === "/about-me/" ? { mainEntity: person } : {}),
  };
  const graph: unknown[] = [page];
  if (pathname === "/")
    graph.push({
      "@type": "WebSite",
      "@id": `${meta.url}/#website`,
      name: meta.siteName,
      url: `${meta.url}/`,
      inLanguage: meta.language,
      creator: person,
    });
  const tag = (key: string, value: unknown, property = false) =>
    value
      ? `<meta ${property ? "property" : "name"}="${key}" content="${escapeHtml(value)}">`
      : "";
  return [
    `<title>${escapeHtml(title)}</title>`,
    tag("description", description),
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    tag(
      "author",
      article
        ? author.name
        : book === "maintenance"
          ? "Juho Vepsäläinen, Artem Sapegin"
          : book
            ? person.name
            : undefined
    ),
    tag("robots", pathname === "/404.html" ? "noindex, follow" : undefined),
    ...Object.entries({
      "og:type": article ? "article" : "website",
      "og:site_name": meta.siteName,
      "og:url": canonical,
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:alt": imageAlt,
      "article:published_time": published,
      "article:modified_time": article ? modified : undefined,
    }).map(([key, value]) => tag(key, value, true)),
    ...Object.entries({
      "twitter:card": "summary_large_image",
      "twitter:site": "@SurviveJS",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
      "twitter:image:alt": imageAlt,
    }).map(([key, value]) => tag(key, value)),
    `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}
