import { readFile } from "node:fs/promises";

const env = {
  ...process.env,
  ...(await readDevVars(".dev.vars")),
};

const imagesEndpoint = env.GET_IMAGES_ENDPOINT;

if (!imagesEndpoint) {
  throw new Error("Missing images endpoint from the environment!");
}

const imagesToken = env.GET_IMAGES_TOKEN;

if (!imagesToken) {
  throw new Error("Missing images token from the environment!");
}

const response = await fetch(imagesEndpoint, {
  headers: {
    Authorization: `Bearer ${imagesToken}`,
  },
});

if (!response.ok) {
  throw new Error(
    `Failed to fetch image references: ${response.status} ${response.statusText}`,
  );
}

const images = Object.fromEntries(
  (await response.json()).map(({ filename, id }) => [filename, id]),
);

console.log(JSON.stringify(images, null, 2));

async function readDevVars(path) {
  try {
    return Object.fromEntries(
      (await readFile(path, "utf8"))
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const separatorIndex = line.indexOf("=");

          if (separatorIndex === -1) {
            return [line, ""];
          }

          return [
            line.slice(0, separatorIndex),
            stripQuotes(line.slice(separatorIndex + 1)),
          ];
        }),
    );
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function stripQuotes(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}
