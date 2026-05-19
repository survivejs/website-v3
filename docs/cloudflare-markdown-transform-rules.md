# Cloudflare Markdown Transform Rules

SurviveJS builds clean markdown assets at these paths:

- `/llms.txt` for the homepage overview
- `/blog/<slug>/index.md` for blog posts
- `/books/<book>/<chapter>/index.md` for book chapters

Use Cloudflare URL Rewrite Transform Rules so requests with `Accept: text/markdown`
are served from those static assets at the CDN layer. This avoids invoking Pages
Functions for normal HTML-to-markdown content negotiation.

## Pages Function Routing

Keep `assets/_routes.json` deployed with the site:

```json
{
  "version": 1,
  "include": ["/mcp", "/mcp/*", "/ping", "/ping/*"],
  "exclude": []
}
```

This limits Pages Function invocations to the real dynamic endpoints. Static
HTML, markdown, JSON, XML, images, and other assets should stay on the Pages
static asset path.

## URL Rewrite Rules

Create these in Cloudflare Dashboard:

`Rules` -> `Transform Rules` -> `URL Rewrite` -> `Create rule`

### 1. Root Markdown

Filter expression:

```txt
http.host eq "survivejs.com"
and http.request.method eq "GET"
and any(http.request.headers["accept"][*] contains "text/markdown")
and http.request.uri.path eq "/"
```

Rewrite path:

- Type: `Static`
- Path: `/llms.txt`

Leave the query string unchanged.

### 2. Directory URLs

Filter expression:

```txt
http.host eq "survivejs.com"
and http.request.method eq "GET"
and any(http.request.headers["accept"][*] contains "text/markdown")
and ends_with(http.request.uri.path, "/")
and http.request.uri.path ne "/"
```

Rewrite path:

- Type: `Dynamic`
- Expression: `concat(http.request.uri.path, "index.md")`

Examples:

- `/blog/kaibanjs-interview/` -> `/blog/kaibanjs-interview/index.md`
- `/books/webpack/introduction/` -> `/books/webpack/introduction/index.md`

Leave the query string unchanged.

### 3. HTML URLs

Filter expression:

```txt
http.host eq "survivejs.com"
and http.request.method eq "GET"
and any(http.request.headers["accept"][*] contains "text/markdown")
and ends_with(http.request.uri.path, "/index.html")
```

Rewrite path:

- Type: `Dynamic`
- Expression: `regex_replace(http.request.uri.path, "/index\\.html$", "/index.md")`

Example:

- `/blog/kaibanjs-interview/index.html` -> `/blog/kaibanjs-interview/index.md`

Leave the query string unchanged.

### 4. Extensionless URLs

Filter expression:

```txt
http.host eq "survivejs.com"
and http.request.method eq "GET"
and any(http.request.headers["accept"][*] contains "text/markdown")
and not ends_with(http.request.uri.path, "/")
and not ends_with(http.request.uri.path, ".html")
and not ends_with(http.request.uri.path, ".md")
and not ends_with(http.request.uri.path, ".txt")
and not ends_with(http.request.uri.path, ".xml")
and not ends_with(http.request.uri.path, ".json")
and not ends_with(http.request.uri.path, ".ico")
and not ends_with(http.request.uri.path, ".png")
and not ends_with(http.request.uri.path, ".jpg")
and not ends_with(http.request.uri.path, ".jpeg")
and not ends_with(http.request.uri.path, ".webp")
and not ends_with(http.request.uri.path, ".svg")
and not starts_with(http.request.uri.path, "/.well-known/")
and http.request.uri.path ne "/mcp"
and http.request.uri.path ne "/ping"
```

Rewrite path:

- Type: `Dynamic`
- Expression: `concat(http.request.uri.path, "/index.md")`

Example:

- `/blog/kaibanjs-interview` -> `/blog/kaibanjs-interview/index.md`

Leave the query string unchanged.

## Validation

After deployment and rule creation, check:

```sh
curl -I -H 'Accept: text/markdown' https://survivejs.com/
curl -I -H 'Accept: text/markdown' https://survivejs.com/blog/kaibanjs-interview/
curl -I -H 'Accept: text/markdown' https://survivejs.com/books/webpack/introduction/
```

Expected:

- `content-type: text/markdown; charset=utf-8` or `text/markdown`
- No Pages Function invocation for static content requests
- `/mcp` and `/ping` still invoke Pages Functions

If a path has no generated markdown file, Cloudflare Pages should return its
normal static 404. That is preferable to falling back to `/llms.txt`, because it
keeps missing markdown coverage visible.
