// OpenAgent.bot — read-only MCP server (zero dependencies).
// Exposes the public registry as MCP tools so agents can discover and query
// attributed, evidence-backed facts about open-source agents, models and tools.
//
// Transport: stdio, newline-delimited JSON-RPC 2.0 (MCP 2024-11-05 compatible).
// Data source: the live public API (override with OPENAGENT_API_BASE).
//
// Run:  node mcp/server.mjs
// Add to an agent: point it at this command (see mcp/manifest.json).

const BASE = (process.env.OPENAGENT_API_BASE || "https://www.openagent.bot").replace(/\/$/, "");
const USER_AGENT = "openagent-mcp/0.1";

/** @type {Record<string, {description: string, inputSchema: object, run: (args: any) => Promise<{content: any[], isError?: boolean}>}>} */
const TOOLS = {
  search_entities: {
    description:
      "Search the OpenAgent registry of open-source agents, models, robots and tools. Returns name, slug, kind, openness status, stars and summary. Use the slug with get_entity.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Free-text query over name, organization and summary." },
        kind: {
          type: "string",
          description: "Entity kind: agent | agent-framework | model | robot | robotics-framework | hardware | simulator | protocol | tool | dataset"
        },
        openness: {
          type: "string",
          description: "Openness status: open-source | open-weights | open-core | source-available | closed | unknown"
        },
        sort: { type: "string", description: "updated | stars | name (default updated)" },
        limit: { type: "number", description: "1-100 (default 20)" }
      }
    },
    run: async (args) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(args || {})) {
        if (v !== undefined && v !== "") params.set(k, String(v));
      }
      const data = await getJson(`${BASE}/api/v1/entities.json?${params.toString()}`);
      const items = Array.isArray(data?.items) ? data.items : [];
      const text = items
        .map((e) => `- ${e.name} (${e.kind}, ${e.opennessStatus ?? "unknown"})${e.stars != null ? ` · ★${e.stars}` : ""} — slug: ${e.slug}\n  ${e.summary ?? ""}`)
        .join("\n");
      return { content: [{ type: "text", text: text || "No matching entities." }] };
    }
  },
  get_entity: {
    description:
      "Get the full attributed dossier (facts, openness facets, changes, relationships) for one registry entity by slug.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "Entity slug, e.g. opencode, vgpu, lerobot" } },
      required: ["slug"]
    },
    run: async (args) => {
      if (!args?.slug) return { content: [{ type: "text", text: "Missing slug." }], isError: true };
      const data = await getJson(`${BASE}/project/${encodeURIComponent(args.slug)}.json`);
      if (!data) return { content: [{ type: "text", text: `Entity "${args.slug}" not found.` }], isError: true };
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  },
  get_stats: {
    description: "Get registry-wide statistics: entity counts by kind, observation count, 30-day change count.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const data = await getJson(`${BASE}/api/v1/stats.json`);
      return { content: [{ type: "text", text: JSON.stringify(data ?? {}, null, 2) }] };
    }
  }
};

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

process.stdin.setEncoding("utf8");
let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (line) handle(line).catch((err) => send({ jsonrpc: "2.0", id: null, error: { code: -32603, message: String(err) } }));
  }
});

async function handle(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  const id = msg.id ?? null;
  if (msg.method === "initialize") {
    return send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "openagent-registry", version: "0.1.0" }
      }
    });
  }
  if (msg.method === "ping") return send({ jsonrpc: "2.0", id, result: {} });
  if (msg.method === "tools/list") {
    return send({
      jsonrpc: "2.0",
      id,
      result: {
        tools: Object.entries(TOOLS).map(([name, t]) => ({
          name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      }
    });
  }
  if (msg.method === "tools/call") {
    const tool = TOOLS[msg.params?.name];
    if (!tool) return send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${msg.params?.name}` } });
    try {
      const result = await tool.run(msg.params?.arguments ?? {});
      return send({ jsonrpc: "2.0", id, result });
    } catch (err) {
      return send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true } });
    }
  }
  if (msg.method && msg.method.endsWith("/notification")) return;
  if (id !== null) send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${msg.method}` } });
}

process.stderr.write(`openagent-mcp ready (base=${BASE})\n`);
