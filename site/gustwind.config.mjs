import { plugin as configRouterPlugin } from "gustwind/routers/config-router";
import { plugin as copyPlugin } from "gustwind/plugins/copy";
import { plugin as htmlispRendererPlugin } from "gustwind/plugins/htmlisp-renderer";
import { plugin as metaPlugin } from "gustwind/plugins/meta";
import { plugin as pagefindPlugin } from "gustwind/plugins/pagefind";
import { plugin as scriptPlugin } from "gustwind/plugins/script";
import { plugin as sitemapPlugin } from "gustwind/plugins/sitemap";
import { plugin as statsPlugin } from "gustwind/plugins/stats";
import { plugin as tailwindPlugin } from "gustwind/plugins/tailwind";

const componentPaths = [
  { path: "./site/components" },
  { path: "./site/layouts" },
];

const copyTargets = [
  { inputPath: "./assets", outputPath: "./" },
  {
    inputPath: "./books/webpack-book/manuscript/images",
    outputPath: "./images/webpack",
  },
  {
    inputPath: "./books/react-book/manuscript/images",
    outputPath: "./images/react",
  },
  {
    inputPath: "./books/maintenance-book/manuscript/images",
    outputPath: "./images/maintenance",
  },
];

function asNodePluginDefinitions() {
  return [
    {
      module: configRouterPlugin,
      options: {
        dataSourcesPath: "./site/dataSources.ts",
        routesPath: "./site/routes.json",
      },
    },
    {
      module: metaPlugin,
      options: { inputPath: "./site/meta.json" },
    },
    {
      module: htmlispRendererPlugin,
      options: {
        components: componentPaths,
        globalUtilitiesPath: "./site/globalUtilities.ts",
      },
    },
    ...copyTargets.map((options) => ({ module: copyPlugin, options })),
    {
      module: scriptPlugin,
      options: {
        scripts: [
          {
            type: "text/javascript",
            src: "https://cdn.jsdelivr.net/npm/sidewind@8.0.0/dist/sidewind.umd.production.min.js",
          },
        ],
        scriptsPath: ["./site/scripts"],
      },
    },
    {
      module: tailwindPlugin,
      options: {
        cssPath: "./site/styles.css",
        setupPath: "./tailwind.config.mjs",
      },
    },
    { module: pagefindPlugin, options: {} },
    { module: sitemapPlugin, options: {} },
    { module: statsPlugin, options: {} },
  ];
}

export { asNodePluginDefinitions };
