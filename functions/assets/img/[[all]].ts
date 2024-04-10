import images from "../../../.images.json" assert { type: "json" };
import { type Env } from "../../../types.ts";

// TODO: Set up a proxy so that gustwind can forward assuming it's running in front
// TODO: Figure out how to handle book images. I.e., images/babel.png
// Likely the images have to be pushed to the origin separately somehow
// and then they need to be resolved here (needs different route but same logic)
export function onRequest(
  context: ExecutionContext & { params: { all?: string[] }; env: Env },
) {
  const all = context.params.all;

  if (!all) {
    return new Response("Not found", { status: 404 });
  }

  const path = `img/${all.join("/")}`;
  const imageId = images[path];

  if (!imageId) {
    return new Response("Not found", { status: 404 });
  }

  const type = "public"; // "public" or "thumb"
  const url = `${context.env.IMAGES_API_URL}?image=${imageId}&type=${type}`;

  return fetch(url);
}
