export const tagGroupLabels = {
  category: "Category",
  capability: "Capability",
  constraint: "Constraint",
  scenario: "Scenario"
} as const;

export const taxonomy = {
  category: [
    "agent",
    "agent-framework",
    "memory-system",
    "model",
    "open-source",
    "plugin",
    "protocol",
    "skill",
    "tool",
    "workflow"
  ],
  capability: [
    "agent-skill",
    "automation",
    "browser",
    "browser-automation",
    "chat-ui",
    "connectors",
    "context-retrieval",
    "inference",
    "local-inference",
    "mcp",
    "memory",
    "model-serving",
    "ollama",
    "plugin",
    "protocol",
    "rag",
    "state",
    "state-management",
    "tool-calling",
    "workflow",
    "workflow-orchestration"
  ],
  constraint: ["api-first", "docker", "local-first", "mcp-compatible", "open-source", "open-weights", "self-hosted", "source-available"],
  scenario: [
    "browser-agent",
    "coding-agent",
    "content-workflow",
    "developer-workflow",
    "local-ai",
    "note-taking",
    "personal-memory",
    "production-agent",
    "research",
    "self-hosted-ai"
  ]
} as const;

export type TaxonomyTagGroup = keyof typeof taxonomy;

export const taxonomyTagSet: ReadonlySet<string> = new Set(Object.values(taxonomy).flat());

export function isControlledTag(value: string): boolean {
  return taxonomyTagSet.has(value);
}

export function labelForTag(value: string): string {
  return value
    .split("-")
    .map((part) => (part === "ai" || part === "api" || part === "mcp" || part === "ui" ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}
