import type { GlobalUtilities } from "gustwind";
import { getEnv } from "../utilities/getEnv.ts";
import { urlJoin } from "../utilities/urlJoin.ts";

const init: GlobalUtilities["init"] = function init() {
  return {
    getSrc(src: string) {
      const imagesRoot = getEnv("IMAGES_ROOT");

      if (!src.startsWith("http") && imagesRoot) {
        return urlJoin(imagesRoot, src);
      }

      return src;
    },
  };
};

export { init };
