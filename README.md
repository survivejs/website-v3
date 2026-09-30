# SurviveJS - Site

This is the source of [https://survivejs.com/](https://survivejs.com/).

## Development

First, clone this repository:

```bash
git clone https://github.com/survivejs/website-v3
```

Set up a `.dev.vars` file:

```bash
GET_IMAGES_ENDPOINT=TODO
GET_IMAGES_TOKEN=TODO
IMAGES_API_URL=TODO
IMAGES_ROOT=TODO
```

Bootstrap the project:

```bash
npm run bootstrap
```

Start the development server:

```bash
npm run start
```

Now you can open the local Wrangler URL.

## Building

Build using the following command:

```bash
npm run build
```

Validate the Cloudflare Worker bundle:

```bash
npm run worker:dry-run
```

## Book source dates

Book overviews show the latest commit affecting the book repository’s
`manuscript` directory. Chapters show the latest commit affecting their own
source file, following renames. Dates use the Git committer date and link to
the exact commit; they do not indicate a technical review of the material.

These dates come from the checked-out repositories under `books/`. Run
`npm run fetch:book-repositories` before building to refresh those checkouts.
Keep their full Git history: builds from source archives or shallow clones
show “Git history unavailable” instead of a guessed date.

## PageSpeed debugging

Run local Lighthouse audits for mobile and desktop:

```bash
npm run lighthouse:local
```

The command builds the site, serves `./build` locally, and writes HTML/JSON
reports to `reports/lighthouse/`.

If Chromium is missing, install the pinned browser first:

```bash
npm run playwright:install
```

For local Agent CI and more Lighthouse options, see
[`docs/development.md`](./docs/development.md).

## Disqus URL migration

When book routes move, generate a Disqus URL Mapper CSV from a Disqus export:

```bash
node utils/generate-disqus-rewrites.js \
  ../site-disqus/survivejs-2026-05-16T09_44_20.025877-all.xml \
  /tmp/disqus-url-map.csv
```

Upload the generated CSV in Disqus under Discussions > Tools > Migrate Threads
> Upload URL Map. Disqus documents this as the required path when a thread URL
changes by more than the base domain.

## License

The site content is available under [CC BY-NC-ND license](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode). So, as long as there's a proper attribution, you can reuse the content. Ideally, you would contribute your improvements back, but that's not necessary.

The site source is available under [MIT license](./LICENSE).

### Content metadata

Page metadata is rendered centrally by `site/utilities/metadata.ts`. Every content
page must have a title and description; a missing value fails the build. Book
chapters derive these from the manuscript, and topic archives get a description
from their topic name. Canonical and Open Graph URLs use the production site URL
and match sitemap paths. The error page is `noindex`; the feed and verification
file are excluded from the sitemap.

JSON-LD describes pages, blog posts, the site, and the author profile. Blog dates
come from frontmatter; book modification dates come from Git, with no build-date
fallback. Atom entries use the same canonical URLs, authors, and source dates.
The shared 1200×630 social preview is bundled at `/images/social.png`; regenerate
it with `npm run generate:social-image` (requires Playwright Chromium).

Run `npm test`, `npm run build:site:validate`, then `npm run check:metadata` to
check the rendered metadata and sitemap together.
