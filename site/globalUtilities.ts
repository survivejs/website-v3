import { urlJoin as urlJoinFn } from "https://bundle.deno.dev/https://deno.land/x/url_join@1.0.0/mod.ts";

function init() {
  function dateToString(date: string) {
    try {
      return (new Date(date)).toISOString().split("T")[0];
    } catch (error) {
      console.error("Failed to parse", date);
      throw new Error(error);
    }
  }

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
  return { dateToString, length, urlJoin };
}

export { init };
