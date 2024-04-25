import type { GlobalUtilities } from "https://deno.land/x/gustwind@v0.71.2/types.ts";

const init: GlobalUtilities["init"] = function init(
  { matchRoute, url: currentUrl },
) {
  async function validateUrl(url: string) {
    if (!url) {
      return;
    }

    // TODO: This would be a good spot to check the url doesn't 404
    // To keep this fast, some kind of local, time-based cache would
    // be good to have to avoid hitting the urls all the time.
    if (url.startsWith("http")) {
      return url;
    }

    const [urlRoot, anchor] = url.split("#");

    if (urlRoot === "/") {
      return url;
    }

    // Some links can have a relative form (i.e., ../foobar) so
    // they have to be resolved into something that can be matched
    // easily.
    const resolvedUrl = urlResolve(currentUrl, urlRoot);

    return `${resolvedUrl}${anchor ? "#" + anchor : ""}`;

    // TODO: Find ways to speed this up as now it takes too much time
    // and effort to match.
    // TODO: Should matchRoute strip #?
    // TODO: Should matchRoute be able to deal with relative links?
    /*
    if (await matchRoute(resolvedUrl)) {
      return `/${resolvedUrl}${anchor ? "#" + anchor : "/"}`;
    }

    throw new Error(
      `Failed to find matching url for "${url}"`,
    );
    */
  }

  return { validateUrl };
};

function urlResolve(root: string, fragment: string) {
  if (fragment.startsWith("../")) {
    return root.split("/").filter(Boolean).slice(0, -1).join("/") + "/" +
      fragment.slice(3);
  }

  return fragment;
}

export { init };
