import type { GlobalUtilities } from "gustwind";
import { getEnv } from "../utilities/getEnv.ts";
import { imageSource } from "../utilities/imageSource.ts";

const init: GlobalUtilities["init"] = function init() {
  return {
    getSrc(src: string) {
      return imageSource(src, getEnv("IMAGES_ROOT"));
    },
  };
};

export { init };
