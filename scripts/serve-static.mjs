import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import process from "node:process";

const root = resolve(process.cwd(), process.argv[2] || "build");
const port = Number.parseInt(readArg("--port") || process.env.PORT || "3000", 10);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

const server = createServer(async (request, response) => {
  try {
    const filePath = await resolveFilePath(request.url || "/");
    const fileStat = await stat(filePath);

    response.writeHead(200, {
      "content-length": fileStat.size,
      "content-type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
});

async function resolveFilePath(rawUrl) {
  const url = new URL(rawUrl, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = resolve(root, `.${pathname}`);

  if (!requestedPath.startsWith(`${root}${sep}`) && requestedPath !== root) {
    throw new Error("Path escapes static root");
  }

  const requestedStat = await stat(requestedPath);

  if (requestedStat.isDirectory()) {
    return join(requestedPath, "index.html");
  }

  return requestedPath;
}

function readArg(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}
