import { buildNode } from "gustwind";
import { asNodePluginDefinitions } from "../site/gustwind.config.mjs";

const outputDirectory = "./build";

try {
  await buildNode({
    cwd: process.cwd(),
    outputDirectory,
    pluginDefinitions: asNodePluginDefinitions(),
    validateOutput: process.argv.includes("--validate"),
    incremental: !process.argv.includes("--no-incremental"),
    cacheFrom: outputDirectory,
  });
} catch (error) {
  if (
    error instanceof TypeError &&
    error.message.includes(".stop is not a function")
  ) {
    console.warn("gustwind: ignored esbuild cleanup compatibility warning");
  } else {
    throw error;
  }
}
