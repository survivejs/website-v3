import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";

const env = await load();

const images = Object.fromEntries((await fetch(env.GET_IMAGES_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${env.GET_IMAGES_TOKEN}`,
  },
}).then((res) => res.json()).catch((err) => console.error(err)) as {
  filename: string;
  id: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}[]).map(({ filename, id }) => [filename, id]));

console.log(JSON.stringify(images, null, 2));
