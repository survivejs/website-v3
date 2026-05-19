import { createCloudflareWorker } from "gustwind/workers/cloudflare";
import images from "../.images.json" assert { type: "json" };
import { onRequest as handleMcp } from "../functions/mcp";

type Env = {
  ASSETS: {
    fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>;
  };
  IMAGES_API_URL?: string;
};

const staticSite = createCloudflareWorker<Env>({
  assetsBinding: "ASSETS",
  render: async (pathname) => {
    throw new Error(`Failed to render ${pathname}`);
  },
});

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ping") {
      return new Response("Hello, world!");
    }

    if (url.pathname === "/mcp") {
      return handleMcp({ request, env });
    }

    if (url.pathname.startsWith("/assets/img/")) {
      return handleImageRequest(url.pathname, env);
    }

    return staticSite.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;

function handleImageRequest(pathname: string, env: Env) {
  if (!env.IMAGES_API_URL) {
    throw new Error("Missing images api url");
  }

  const imagePath = pathname.replace(/^\/assets\//, "");
  const imageId = images[imagePath as keyof typeof images];

  if (!imageId) {
    return new Response("Not found", { status: 404 });
  }

  return fetch(`${env.IMAGES_API_URL}${imageId}/public`);
}
