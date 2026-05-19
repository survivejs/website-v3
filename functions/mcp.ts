type PagesContext = {
  request: Request;
  env: {
    ASSETS: {
      fetch: (request: Request) => Promise<Response>;
    };
  };
};

type JsonRpcRequest = {
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: {
      path?: string;
    };
    uri?: string;
  };
};

const RESOURCE_PATHS = new Map([
  ["/llms.txt", "text/markdown; charset=utf-8"],
  ["/sitemap.xml", "application/xml; charset=utf-8"],
  ["/.well-known/agent-skills/index.json", "application/json; charset=utf-8"],
]);

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  if (context.request.method !== "POST") {
    return json({ error: "Use POST with JSON-RPC requests." }, { status: 405 });
  }

  let message: JsonRpcRequest;

  try {
    message = await context.request.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error"));
  }

  const id = message.id ?? null;

  switch (message.method) {
    case "initialize":
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-06-18",
          capabilities: {
            resources: {},
            tools: {},
          },
          serverInfo: {
            name: "survivejs-content",
            version: "1.0.0",
          },
        },
      });

    case "resources/list":
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          resources: Array.from(RESOURCE_PATHS.entries()).map(
            ([path, mimeType]) => ({
              uri: `https://survivejs.com${path}`,
              name: resourceName(path),
              mimeType,
            })
          ),
        },
      });

    case "resources/read": {
      const path = normalizeResourcePath(message.params?.uri);

      return readResource(context, id, path);
    }

    case "tools/list":
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "read_survivejs_resource",
              description:
                "Read a public SurviveJS discovery resource such as /llms.txt or /sitemap.xml.",
              inputSchema: {
                type: "object",
                properties: {
                  path: {
                    type: "string",
                    enum: Array.from(RESOURCE_PATHS.keys()),
                  },
                },
                required: ["path"],
              },
            },
          ],
        },
      });

    case "tools/call": {
      if (message.params?.name !== "read_survivejs_resource") {
        return json(rpcError(id, -32602, "Unknown tool"));
      }

      return readResource(context, id, message.params.arguments?.path);
    }

    default:
      return json(rpcError(id, -32601, "Method not found"));
  }
}

async function readResource(
  context: PagesContext,
  id: JsonRpcRequest["id"],
  path: string | undefined
) {
  if (!path || !RESOURCE_PATHS.has(path)) {
    return json(rpcError(id ?? null, -32602, "Unsupported resource path"));
  }

  const url = new URL(path, context.request.url);
  const response = await context.env.ASSETS.fetch(
    new Request(url, {
      headers: context.request.headers,
      method: "GET",
    })
  );

  if (!response.ok) {
    return json(rpcError(id ?? null, -32000, "Resource not found"));
  }

  const text = await response.text();
  const mimeType = RESOURCE_PATHS.get(path);

  return json({
    jsonrpc: "2.0",
    id,
    result: {
      content: [
        {
          type: "text",
          text,
          mimeType,
        },
      ],
      contents: [
        {
          uri: `https://survivejs.com${path}`,
          mimeType,
          text,
        },
      ],
    },
  });
}

function normalizeResourcePath(uri: string | undefined) {
  if (!uri) {
    return undefined;
  }

  try {
    return new URL(uri).pathname;
  } catch {
    return uri;
  }
}

function resourceName(path: string) {
  switch (path) {
    case "/llms.txt":
      return "SurviveJS agent overview";
    case "/sitemap.xml":
      return "SurviveJS sitemap";
    case "/.well-known/agent-skills/index.json":
      return "SurviveJS Agent Skills index";
    default:
      return path;
  }
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  };
}

function json(
  value: unknown,
  init: { status?: number; statusText?: string; headers?: Record<string, string> } = {}
) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...init.headers,
    },
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, mcp-protocol-version",
  };
}
