function getMemo<T extends (input: any) => unknown>(cache: Map<string, unknown>) {
  return async function memo(fn: T, input: Parameters<T>[0]) {
    const key = JSON.stringify(input);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const ret = await fn(input);

    cache.set(key, ret);

    return ret;
  };
}

export { getMemo };
