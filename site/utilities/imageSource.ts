import { urlJoin } from "./urlJoin.ts";

// Only legacy image paths use the image service. Bundled assets stay local.
export function imageSource(src: string, imagesRoot?: string) {
  return imagesRoot && src.startsWith("/assets/img/")
    ? urlJoin(imagesRoot, src)
    : src;
}
