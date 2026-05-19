import { readFileSync } from "node:fs";

let cachedDevVars: Record<string, string> | undefined;

function getEnv(name: string) {
  return process.env[name] || getDevVars()[name];
}

function getDevVars() {
  if (cachedDevVars) {
    return cachedDevVars;
  }

  try {
    cachedDevVars = Object.fromEntries(
      readFileSync(".dev.vars", "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const separator = line.indexOf("=");

          return [
            line.slice(0, separator),
            line.slice(separator + 1).replace(/^"|"$/g, ""),
          ];
        }),
    );
  } catch {
    cachedDevVars = {};
  }

  return cachedDevVars;
}

export { getEnv };
