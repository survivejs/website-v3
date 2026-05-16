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
deno task bootstrap
```

Start the development server:

```bash
deno task start
```

Now you can go to [http://localhost:3000](http://localhost:3000).

## Building

Build using the following command:

```bash
deno task build
```

Deploy `./build`.

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
