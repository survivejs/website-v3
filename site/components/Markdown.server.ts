import getMarkdown from "../transforms/markdown.ts";
import type { DataSourcesApi } from "https://deno.land/x/gustwind@v0.70.3/types.ts";

function init({ load, render }: DataSourcesApi) {
  const markdown = getMarkdown({ load, render });

  return {
    processMarkdown: async (input: string) => (await markdown(input)).content,
  };
}

export { init };
