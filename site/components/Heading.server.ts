// TODO: Figure out how to share the same anchor id across a heading and an anchor
// Maybe there has to be some way to bind values to a scope (implicit earlier)
// when noop is used. Potentially (get local id) specifically for noop.
function init() {
  let foundIds: Record<string, number> = {};
  function getUniqueAnchorId(anchor: string) {
    // @ts-expect-error This is fine.
    const { url } = this.context;

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

  function invert(b: boolean) {
    return !b;
  }

  function _onRenderStart() {
    // To avoid having stale id cache, erase it when page rendering begins.
    foundIds = {};
  }

  return { getUniqueAnchorId, invert, _onRenderStart };
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
