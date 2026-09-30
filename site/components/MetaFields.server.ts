import { renderMetadata } from "../utilities/metadata.ts";
export function init() {
  return {
    pageMetadata(this: { context: Parameters<typeof renderMetadata>[0] }) {
      return renderMetadata(this.context);
    },
  };
}
