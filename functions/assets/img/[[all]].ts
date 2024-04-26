import images from "../../../.images.json" assert { type: "json" };
import { type Env } from "../../../types.ts";

// TODO: Figure out how to handle book images. I.e., images/babel.png
// Likely the images have to be pushed to the origin separately somehow
// and then they need to be resolved here (needs different route but same logic)
export function onRequest(
  context: ExecutionContext & { params: { all?: string[] }; env: Env },
) {
  if (!context.env.IMAGES_API_URL) {
    throw new Error("Missing images api url");
  }

  const all = context.params.all;

  if (!all) {
    return new Response("Not found", { status: 404 });
  }

  const path = `img/${all.join("/")}`;

  // @ts-expect-error This is fine because images is missing keys
  const imageId = images[path];

  if (!imageId) {
    return new Response("Not found", { status: 404 });
  }

  const type = "public"; // "public" or "thumb"
  // The assumption here is that IMAGES_API_URL ends with a slash
  const url = `${context.env.IMAGES_API_URL}${imageId}/${type}`;

  return fetch(url);
}
