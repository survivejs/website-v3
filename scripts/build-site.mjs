import { buildNode } from "gustwind";
import { asNodePluginDefinitions } from "../site/gustwind.config.mjs";

const outputDirectory = "./build";

await buildNode({
  cwd: process.cwd(),
  outputDirectory,
  pluginDefinitions: asNodePluginDefinitions(),
  validateOutput: process.argv.includes("--validate"),
  incremental: !process.argv.includes("--no-incremental"),
  cacheFrom: outputDirectory,
});
