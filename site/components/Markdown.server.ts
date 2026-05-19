import getMarkdown from "../transforms/markdown.ts";
import { unwrapRawHtml } from "gustwind/htmlisp";
import type { DataSourcesApi } from "gustwind";

function init({ load, render, renderSync }: DataSourcesApi) {
  const markdown = getMarkdown({ load, render, renderSync });

  return {
    processMarkdown: async (input: string) =>
      (await markdown({ input: unwrapRawHtml(input) })).content,
  };
}

export { init };
