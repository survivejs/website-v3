import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";

// load() doesn't check env, just possible .dev.vars file
const env = await load({ envPath: "./.dev.vars" });

const imagesEndpoint = env.GET_IMAGES_ENDPOINT ||
  Deno.env.get("GET_IMAGES_ENDPOINT");

if (!imagesEndpoint) {
  throw new Error("Missing images endpoint from the environment!");
}

const imagesToken = env.GET_IMAGES_TOKEN || Deno.env.get("GET_IMAGES_TOKEN");

if (!imagesToken) {
  throw new Error("Missing images token from the environment!");
}

const images = Object.fromEntries((await fetch(imagesEndpoint, {
  headers: {
    Authorization: `Bearer ${imagesToken}`,
  },
}).then((res) => res.json()).catch((err) => console.error(err)) as {
  filename: string;
  id: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}[]).map(({ filename, id }) => [filename, id]));

console.log(JSON.stringify(images, null, 2));
