# SurviveJS - Site

This is the source of [https://survivejs.com/](https://survivejs.com/).

## Development

First, clone this repository:

```bash
git clone https://github.com/survivejs/website-v3
```

Set up a `.env` file:

```bash
GET_IMAGES_ENDPOINT=TODO
GET_IMAGES_TOKEN=TODO
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

## License

The site content is available under [CC BY-NC-ND license](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode). So, as long as there's a proper attribution, you can reuse the content. Ideally, you would contribute your improvements back, but that's not necessary.

The site source is available under [MIT license](./LICENSE).
