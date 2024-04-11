import { urlJoin as urlJoinFn } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";
import type { Routes } from "https://deno.land/x/gustwind@v0.66.2/types.ts";

function init({ routes }: { routes: Routes }) {
  function length(arr: unknown[]) {
    return arr.length;
  }

  function urlJoin(...parts: string[]) {
    if (!parts.every((s) => typeof s === "string")) {
      console.error(parts);
      throw new Error("Failed to join url");
    }

    return urlJoinFn(...parts);
  }

  // Add your global page utilities here.
  // Alternatively they can be defined per component.
  return { length, urlJoin };
}

export { init };
