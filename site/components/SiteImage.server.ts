import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { urlJoin } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";
import type { GlobalUtilities } from "https://deno.land/x/gustwind@v0.71.2/types.ts";

// load() doesn't check env, just possible .dev.vars file
const env = await load({ envPath: "./.dev.vars" });

const init: GlobalUtilities["init"] = function init() {
  return {
    getSrc(src: string) {
      if (!src.startsWith("http") && env.IMAGES_ROOT) {
        return urlJoin(env.IMAGES_ROOT, src);
      }

      return src;
    },
  };
};

export { init };
