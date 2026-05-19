type PagesContext = {
  request: Request;
  env: {
    ASSETS: {
      fetch: (request: Request) => Promise<Response>;
    };
  };
  next: () => Promise<Response>;
};

const DISCOVERY_LINKS = [
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
];

export async function onRequest(context: PagesContext) {
  const response = await context.next();
  const headers = new Headers(response.headers);

  appendDiscoveryLinks(headers);

  if (!shouldReturnMarkdown(context.request, response)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const markdownResponse = await fetchMarkdownAsset(context);

  if (!markdownResponse) {
    return response;
  }

  const markdown = await markdownResponse.text();

  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("x-markdown-tokens", String(estimateTokens(markdown)));
  headers.delete("content-length");

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function shouldReturnMarkdown(request: Request, response: Response) {
  if (request.method !== "GET") {
    return false;
  }

  const accept = request.headers.get("accept") || "";
  const contentType = response.headers.get("content-type") || "";

  return accept.includes("text/markdown") && contentType.includes("text/html");
}

async function fetchMarkdownAsset(context: PagesContext) {
  const sourceUrl = resolveMarkdownUrl(context.request.url);
  const response = await context.env.ASSETS.fetch(
    new Request(sourceUrl, context.request)
  );

  if (response.ok) {
    return response;
  }

  const fallbackResponse = await context.env.ASSETS.fetch(
    new Request(new URL("/llms.txt", context.request.url), context.request)
  );

  return fallbackResponse.ok ? fallbackResponse : undefined;
}

function resolveMarkdownUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (url.pathname === "/") {
    url.pathname = "/llms.txt";

    return url;
  }

  if (url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}index.md`;

    return url;
  }

  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.replace(/\/index\.html$/, "/index.md");

    return url;
  }

  if (url.pathname.endsWith(".html")) {
    url.pathname = url.pathname.replace(/\.html$/, ".md");

    return url;
  }

  url.pathname = `${url.pathname}/index.md`;

  return url;
}

function appendDiscoveryLinks(headers: Headers) {
  const current = headers.get("link");
  const values = current ? [current] : [];

  for (const link of DISCOVERY_LINKS) {
    if (!current?.includes(link)) {
      values.push(link);
    }
  }

  if (values.length > 0) {
    headers.set("link", values.join(", "));
  }
}

function estimateTokens(value: string) {
  return Math.ceil(value.length / 4);
}
