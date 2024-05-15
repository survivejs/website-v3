function init() {
  let foundIds: Record<string, number> = {};

  function resolveAnchor(v: string, children: string) {
    if (v) {
      return v;
    }

    // @ts-expect-error This is fine.
    const { url } = this.context;

    return getUniqueAnchorId(url, children);
  }

  function getUniqueAnchorId(url: string, anchor: string) {
    if (!anchor || Array.isArray(anchor) || isObject(anchor)) {
      return;
    }

    let id = slugify(anchor);

    // Make sure ids are unique per page
    const cacheId = `${url}-${id}`;

    // Check for a duplicate id
    if (foundIds[cacheId]) {
      foundIds[cacheId]++;

      id += `-${foundIds[cacheId]}`;
    } else {
      foundIds[cacheId] = 1;
    }

    return id;
  }

  function _onRenderStart() {
    // To avoid having stale id cache, erase it when page rendering begins.
    foundIds = {};
  }

  return { resolveAnchor, getUniqueAnchorId, _onRenderStart };
}

function slugify(idBase: string) {
  return idBase
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w]+/g, "-");
}

// deno-lint-ignore no-explicit-any
const isObject = (a: any) =>
  a !== null && !Array.isArray(a) && typeof a === "object";

export { init };
