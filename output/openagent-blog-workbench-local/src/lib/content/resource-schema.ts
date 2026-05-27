import { taxonomy, type TaxonomyTagGroup } from "./taxonomy";

export const resourceStatuses = ["draft", "published", "archived", "hidden"] as const;
export const resourceTypes = ["model", "agent", "memory_system", "skill", "plugin", "tool", "protocol", "workflow"] as const;
export const difficulties = ["beginner", "intermediate", "advanced"] as const;
export const maturities = ["experimental", "active", "stable", "legacy"] as const;
export const deploymentModes = ["local", "self_hosted", "cloud", "hybrid"] as const;
export const audiences = ["developer", "agent_builder", "researcher", "operator", "creator", "general_user", "team"] as const;
export const pricingModels = ["open_source", "free", "freemium", "paid", "enterprise", "unknown"] as const;
export const linkTypes = [
  "homepage",
  "github",
  "docs",
  "demo",
  "install",
  "api_reference",
  "paper",
  "discord",
  "x",
  "huggingface",
  "npm",
  "pypi",
  "docker"
] as const;

export const primaryCategories = ["models", "agents", "memory-systems", "skills", "plugins", "tools", "protocols", "workflows"] as const;

const allowedTopLevelKeys = [
  "schema_version",
  "id",
  "slug",
  "status",
  "identity",
  "classification",
  "positioning",
  "decision_signals",
  "facts",
  "capabilities",
  "links",
  "media",
  "tags",
  "relationships",
  "machine_readable",
  "seo",
  "editorial",
  "timestamps"
] as const;

export type ResourceStatus = (typeof resourceStatuses)[number];
export type ResourceType = (typeof resourceTypes)[number];
export type Difficulty = (typeof difficulties)[number];
export type Maturity = (typeof maturities)[number];
export type DeploymentMode = (typeof deploymentModes)[number];
export type Audience = (typeof audiences)[number];
export type PricingModel = (typeof pricingModels)[number];
export type LinkType = (typeof linkTypes)[number];
export type PrimaryCategory = (typeof primaryCategories)[number];
export type TagGroup = TaxonomyTagGroup;

export type ResourceLink = {
  type: LinkType;
  label: string;
  url: string;
};

export type EditorialStrength = {
  title: string;
  description: string;
  why_it_matters?: string;
};

export type EditorialUseCase = {
  title: string;
  description: string;
};

export type EditorialCompareNote = {
  title: string;
  summary: string;
  against?: string;
};

export type EditorialGettingStarted = {
  label: string;
  url: string;
  type: LinkType;
};

export type EditorialCommandLine = {
  label: string;
  command: string;
  description?: string;
};

export type EditorialFaqItem = {
  question: string;
  answer: string;
};

export type EditorialSeoArticle = {
  intro?: string;
  what_it_is?: string;
  why_it_matters?: string;
  how_it_works?: string;
  use_cases?: EditorialUseCase[];
  alternatives?: EditorialCompareNote[];
  getting_started?: EditorialGettingStarted[];
  faq?: EditorialFaqItem[];
};

export type ThumbnailBrief = {
  resource_type?: string;
  visual_motif?: string;
  background_style?: string;
  title_overlay?: string;
  subtitle?: string;
  priority_assets?: string[];
  avoid?: string[];
};

export type ResourceV1 = {
  schema_version: "openagent.resource.v1";
  id: string;
  slug: string;
  status: ResourceStatus;
  identity: {
    name: string;
    short_name?: string;
    one_liner: string;
    short_description?: string;
    long_description?: string;
  };
  classification: {
    resource_type: ResourceType;
    primary_category: PrimaryCategory;
    subcategories?: string[];
  };
  positioning: {
    why_it_matters?: string;
    best_for?: string[];
    not_for?: string[];
    use_cases?: string[];
    target_audience?: Audience[];
    difficulty?: Difficulty;
    maturity?: Maturity;
  };
  decision_signals: {
    deployment_modes?: DeploymentMode[];
    open_source: boolean;
    local_first?: boolean;
    self_hostable?: boolean;
    has_api?: boolean;
    has_cli?: boolean;
    has_gui?: boolean;
    supports_mcp?: boolean;
    supports_docker?: boolean;
    multi_platform?: boolean;
  };
  facts: {
    license?: string;
    primary_language?: string;
    platforms?: string[];
    pricing_model?: PricingModel;
    github_stars?: number;
    github_forks?: number;
    github_last_commit_at?: string;
    github_repo_full_name?: string;
    last_verified_at?: string;
    official_launch_year?: number;
  };
  capabilities: {
    core_capabilities?: string[];
    integrations?: string[];
    interfaces?: string[];
  };
  links: {
    primary_url: string;
    items: ResourceLink[];
  };
  media: {
    thumbnail_url?: string;
    og_image_url?: string;
    logo_url?: string;
    gallery_urls?: string[];
    thumbnail_brief?: ThumbnailBrief;
  };
  tags: {
    category: string[];
    capability: string[];
    constraint: string[];
    scenario: string[];
  };
  relationships: {
    similar_resources?: string[];
    alternatives?: string[];
    integrates_with?: string[];
    compare_with?: string[];
  };
  machine_readable: {
    canonical_url: string;
    json_url: string;
    markdown_url: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  editorial?: {
    featured_reason?: string;
    trust_note?: string;
    core_strengths?: EditorialStrength[];
    use_case_notes?: EditorialUseCase[];
    compare_notes?: EditorialCompareNote[];
    getting_started?: EditorialGettingStarted[];
    command_line?: EditorialCommandLine[];
    seo_article?: EditorialSeoArticle;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
    published_at?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNoUnknownKeys(record: Record<string, unknown>, allowed: readonly string[], context: string): void {
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      throw new Error(`${context} has unknown field "${key}".`);
    }
  }
}

function requireString(record: Record<string, unknown>, key: string, context: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string, context: string): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error(`${context}.${key} must be a string when present.`);
  }
  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string, context: string): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${context}.${key} must be a number when present.`);
  }
  return value;
}

function requireBoolean(record: Record<string, unknown>, key: string, context: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new Error(`${context}.${key} must be a boolean.`);
  }
  return value;
}

function optionalBoolean(record: Record<string, unknown>, key: string, context: string): boolean | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new Error(`${context}.${key} must be a boolean when present.`);
  }
  return value;
}

function requireStringArray(record: Record<string, unknown>, key: string, context: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${context}.${key} must be a non-empty string array.`);
  }
  return value;
}

function optionalStringArray(record: Record<string, unknown>, key: string, context: string): string[] | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${context}.${key} must be a string array when present.`);
  }
  return value;
}

function optionalRecordArray(record: Record<string, unknown>, key: string, context: string): Record<string, unknown>[] | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => !isRecord(item))) {
    throw new Error(`${context}.${key} must be an object array when present.`);
  }
  return value;
}

function requireEnum<T extends readonly string[]>(record: Record<string, unknown>, key: string, allowed: T, context: string): T[number] {
  const value = requireString(record, key, context);
  if (!allowed.includes(value)) {
    throw new Error(`${context}.${key} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

function optionalEnum<T extends readonly string[]>(record: Record<string, unknown>, key: string, allowed: T, context: string): T[number] | undefined {
  const value = optionalString(record, key, context);
  if (value === undefined) return undefined;
  if (!allowed.includes(value)) {
    throw new Error(`${context}.${key} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

function optionalEnumArray<T extends readonly string[]>(record: Record<string, unknown>, key: string, allowed: T, context: string): T[number][] | undefined {
  const values = optionalStringArray(record, key, context);
  if (!values) return undefined;
  for (const value of values) {
    if (!allowed.includes(value)) {
      throw new Error(`${context}.${key} contains invalid value "${value}".`);
    }
  }
  return values as T[number][];
}

function assertUrl(value: string, context: string): void {
  try {
    new URL(value);
  } catch {
    throw new Error(`${context} must be a valid URL.`);
  }
}

function optionalUrl(record: Record<string, unknown>, key: string, context: string): string | undefined {
  const value = optionalString(record, key, context);
  if (value !== undefined) assertUrl(value, `${context}.${key}`);
  return value;
}

function parseIdentity(input: unknown, status: ResourceStatus): ResourceV1["identity"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.identity must be an object.");
    return { name: "Untitled", one_liner: "Draft resource." };
  }
  assertNoUnknownKeys(input, ["name", "short_name", "one_liner", "short_description", "long_description"], "resource.identity");
  return {
    name: status === "published" ? requireString(input, "name", "resource.identity") : (optionalString(input, "name", "resource.identity") ?? "Untitled"),
    short_name: optionalString(input, "short_name", "resource.identity"),
    one_liner: status === "published" ? requireString(input, "one_liner", "resource.identity") : (optionalString(input, "one_liner", "resource.identity") ?? "Draft resource."),
    short_description: optionalString(input, "short_description", "resource.identity"),
    long_description: optionalString(input, "long_description", "resource.identity")
  };
}

function parseClassification(input: unknown, status: ResourceStatus): ResourceV1["classification"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.classification must be an object.");
    return { resource_type: "tool", primary_category: "tools" };
  }
  assertNoUnknownKeys(input, ["resource_type", "primary_category", "subcategories"], "resource.classification");
  return {
    resource_type: status === "published" ? requireEnum(input, "resource_type", resourceTypes, "resource.classification") : (optionalEnum(input, "resource_type", resourceTypes, "resource.classification") ?? "tool"),
    primary_category:
      status === "published" ? requireEnum(input, "primary_category", primaryCategories, "resource.classification") : (optionalEnum(input, "primary_category", primaryCategories, "resource.classification") ?? "tools"),
    subcategories: optionalStringArray(input, "subcategories", "resource.classification")
  };
}

function parsePositioning(input: unknown): ResourceV1["positioning"] {
  if (input === undefined) return {};
  if (!isRecord(input)) throw new Error("resource.positioning must be an object when present.");
  assertNoUnknownKeys(input, ["why_it_matters", "best_for", "not_for", "use_cases", "target_audience", "difficulty", "maturity"], "resource.positioning");
  return {
    why_it_matters: optionalString(input, "why_it_matters", "resource.positioning"),
    best_for: optionalStringArray(input, "best_for", "resource.positioning"),
    not_for: optionalStringArray(input, "not_for", "resource.positioning"),
    use_cases: optionalStringArray(input, "use_cases", "resource.positioning"),
    target_audience: optionalEnumArray(input, "target_audience", audiences, "resource.positioning"),
    difficulty: optionalEnum(input, "difficulty", difficulties, "resource.positioning"),
    maturity: optionalEnum(input, "maturity", maturities, "resource.positioning")
  };
}

function parseDecisionSignals(input: unknown, status: ResourceStatus): ResourceV1["decision_signals"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.decision_signals must be an object.");
    return { open_source: false };
  }
  assertNoUnknownKeys(
    input,
    ["deployment_modes", "open_source", "local_first", "self_hostable", "has_api", "has_cli", "has_gui", "supports_mcp", "supports_docker", "multi_platform"],
    "resource.decision_signals"
  );
  return {
    deployment_modes: optionalEnumArray(input, "deployment_modes", deploymentModes, "resource.decision_signals"),
    open_source: status === "published" ? requireBoolean(input, "open_source", "resource.decision_signals") : (optionalBoolean(input, "open_source", "resource.decision_signals") ?? false),
    local_first: optionalBoolean(input, "local_first", "resource.decision_signals"),
    self_hostable: optionalBoolean(input, "self_hostable", "resource.decision_signals"),
    has_api: optionalBoolean(input, "has_api", "resource.decision_signals"),
    has_cli: optionalBoolean(input, "has_cli", "resource.decision_signals"),
    has_gui: optionalBoolean(input, "has_gui", "resource.decision_signals"),
    supports_mcp: optionalBoolean(input, "supports_mcp", "resource.decision_signals"),
    supports_docker: optionalBoolean(input, "supports_docker", "resource.decision_signals"),
    multi_platform: optionalBoolean(input, "multi_platform", "resource.decision_signals")
  };
}

function parseFacts(input: unknown): ResourceV1["facts"] {
  if (input === undefined) return {};
  if (!isRecord(input)) throw new Error("resource.facts must be an object when present.");
  assertNoUnknownKeys(
    input,
    ["license", "primary_language", "platforms", "pricing_model", "github_stars", "github_forks", "github_last_commit_at", "github_repo_full_name", "last_verified_at", "official_launch_year"],
    "resource.facts"
  );
  return {
    license: optionalString(input, "license", "resource.facts"),
    primary_language: optionalString(input, "primary_language", "resource.facts"),
    platforms: optionalStringArray(input, "platforms", "resource.facts"),
    pricing_model: optionalEnum(input, "pricing_model", pricingModels, "resource.facts"),
    github_stars: optionalNumber(input, "github_stars", "resource.facts"),
    github_forks: optionalNumber(input, "github_forks", "resource.facts"),
    github_last_commit_at: optionalString(input, "github_last_commit_at", "resource.facts"),
    github_repo_full_name: optionalString(input, "github_repo_full_name", "resource.facts"),
    last_verified_at: optionalString(input, "last_verified_at", "resource.facts"),
    official_launch_year: optionalNumber(input, "official_launch_year", "resource.facts")
  };
}

function parseCapabilities(input: unknown): ResourceV1["capabilities"] {
  if (input === undefined) return {};
  if (!isRecord(input)) throw new Error("resource.capabilities must be an object when present.");
  assertNoUnknownKeys(input, ["core_capabilities", "integrations", "interfaces"], "resource.capabilities");
  return {
    core_capabilities: optionalStringArray(input, "core_capabilities", "resource.capabilities"),
    integrations: optionalStringArray(input, "integrations", "resource.capabilities"),
    interfaces: optionalStringArray(input, "interfaces", "resource.capabilities")
  };
}

function parseLinks(input: unknown, status: ResourceStatus): ResourceV1["links"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.links must be an object.");
    return { primary_url: "https://www.openagent.bot", items: [] };
  }
  assertNoUnknownKeys(input, ["primary_url", "items"], "resource.links");
  const primaryUrl = status === "published" ? requireString(input, "primary_url", "resource.links") : (optionalString(input, "primary_url", "resource.links") ?? "https://www.openagent.bot");
  assertUrl(primaryUrl, "resource.links.primary_url");
  const rawItems = input.items;
  if (!Array.isArray(rawItems)) {
    if (status === "published") throw new Error("resource.links.items must be an array.");
    return { primary_url: primaryUrl, items: [] };
  }
  const items = rawItems.map((item, index) => {
    if (!isRecord(item)) throw new Error(`resource.links.items[${index}] must be an object.`);
    assertNoUnknownKeys(item, ["type", "label", "url"], `resource.links.items[${index}]`);
    const url = requireString(item, "url", `resource.links.items[${index}]`);
    assertUrl(url, `resource.links.items[${index}].url`);
    return {
      type: requireEnum(item, "type", linkTypes, `resource.links.items[${index}]`),
      label: requireString(item, "label", `resource.links.items[${index}]`),
      url
    };
  });
  if (status === "published" && items.length === 0) throw new Error("resource.links.items must contain at least one link for published resources.");
  return { primary_url: primaryUrl, items };
}

function parseMedia(input: unknown): ResourceV1["media"] {
  if (input === undefined) return {};
  if (!isRecord(input)) throw new Error("resource.media must be an object when present.");
  assertNoUnknownKeys(input, ["thumbnail_url", "og_image_url", "logo_url", "gallery_urls", "thumbnail_brief"], "resource.media");
  let thumbnailBrief: ThumbnailBrief | undefined;
  if (input.thumbnail_brief !== undefined) {
    if (!isRecord(input.thumbnail_brief)) throw new Error("resource.media.thumbnail_brief must be an object when present.");
    assertNoUnknownKeys(input.thumbnail_brief, ["resource_type", "visual_motif", "background_style", "title_overlay", "subtitle", "priority_assets", "avoid"], "resource.media.thumbnail_brief");
    thumbnailBrief = {
      resource_type: optionalString(input.thumbnail_brief, "resource_type", "resource.media.thumbnail_brief"),
      visual_motif: optionalString(input.thumbnail_brief, "visual_motif", "resource.media.thumbnail_brief"),
      background_style: optionalString(input.thumbnail_brief, "background_style", "resource.media.thumbnail_brief"),
      title_overlay: optionalString(input.thumbnail_brief, "title_overlay", "resource.media.thumbnail_brief"),
      subtitle: optionalString(input.thumbnail_brief, "subtitle", "resource.media.thumbnail_brief"),
      priority_assets: optionalStringArray(input.thumbnail_brief, "priority_assets", "resource.media.thumbnail_brief"),
      avoid: optionalStringArray(input.thumbnail_brief, "avoid", "resource.media.thumbnail_brief")
    };
  }
  const media = {
    thumbnail_url: optionalUrl(input, "thumbnail_url", "resource.media"),
    og_image_url: optionalUrl(input, "og_image_url", "resource.media"),
    logo_url: optionalUrl(input, "logo_url", "resource.media"),
    gallery_urls: optionalStringArray(input, "gallery_urls", "resource.media"),
    thumbnail_brief: thumbnailBrief
  };
  media.gallery_urls?.forEach((url, index) => assertUrl(url, `resource.media.gallery_urls[${index}]`));
  return media;
}

function parseTags(input: unknown, status: ResourceStatus): ResourceV1["tags"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.tags must be an object.");
    return { category: [], capability: [], constraint: [], scenario: [] };
  }
  assertNoUnknownKeys(input, ["category", "capability", "constraint", "scenario"], "resource.tags");
  const parsed = {
    category: requireStringArray(input, "category", "resource.tags"),
    capability: requireStringArray(input, "capability", "resource.tags"),
    constraint: requireStringArray(input, "constraint", "resource.tags"),
    scenario: requireStringArray(input, "scenario", "resource.tags")
  };

  for (const group of Object.keys(parsed) as TagGroup[]) {
    const values = parsed[group];
    if (status === "published" && values.length === 0) {
      throw new Error(`resource.tags.${group} must contain at least one tag for published resources.`);
    }
    if (values.length > 5) {
      throw new Error(`resource.tags.${group} must contain at most 5 tags.`);
    }
    for (const value of values) {
      if (!(taxonomy[group] as readonly string[]).includes(value)) {
        throw new Error(`resource.tags.${group} contains unknown tag "${value}".`);
      }
    }
  }

  return parsed;
}

function parseRelationships(input: unknown): ResourceV1["relationships"] {
  if (input === undefined) return {};
  if (!isRecord(input)) throw new Error("resource.relationships must be an object when present.");
  assertNoUnknownKeys(input, ["similar_resources", "alternatives", "integrates_with", "compare_with"], "resource.relationships");
  return {
    similar_resources: optionalStringArray(input, "similar_resources", "resource.relationships"),
    alternatives: optionalStringArray(input, "alternatives", "resource.relationships"),
    integrates_with: optionalStringArray(input, "integrates_with", "resource.relationships"),
    compare_with: optionalStringArray(input, "compare_with", "resource.relationships")
  };
}

function parseMachineReadable(input: unknown, status: ResourceStatus): ResourceV1["machine_readable"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.machine_readable must be an object.");
    return { canonical_url: "https://www.openagent.bot", json_url: "https://www.openagent.bot/index.json", markdown_url: "https://www.openagent.bot/llms.txt" };
  }
  assertNoUnknownKeys(input, ["canonical_url", "json_url", "markdown_url"], "resource.machine_readable");
  const canonicalUrl = requireString(input, "canonical_url", "resource.machine_readable");
  const jsonUrl = requireString(input, "json_url", "resource.machine_readable");
  const markdownUrl = requireString(input, "markdown_url", "resource.machine_readable");
  assertUrl(canonicalUrl, "resource.machine_readable.canonical_url");
  assertUrl(jsonUrl, "resource.machine_readable.json_url");
  assertUrl(markdownUrl, "resource.machine_readable.markdown_url");
  return { canonical_url: canonicalUrl, json_url: jsonUrl, markdown_url: markdownUrl };
}

function parseSeo(input: unknown): ResourceV1["seo"] {
  if (input === undefined) return undefined;
  if (!isRecord(input)) throw new Error("resource.seo must be an object when present.");
  assertNoUnknownKeys(input, ["title", "description"], "resource.seo");
  return {
    title: optionalString(input, "title", "resource.seo"),
    description: optionalString(input, "description", "resource.seo")
  };
}

function parseEditorial(input: unknown): ResourceV1["editorial"] {
  if (input === undefined) return undefined;
  if (!isRecord(input)) throw new Error("resource.editorial must be an object when present.");
  assertNoUnknownKeys(input, ["featured_reason", "trust_note", "core_strengths", "use_case_notes", "compare_notes", "getting_started", "command_line", "seo_article"], "resource.editorial");
  const coreStrengths = optionalRecordArray(input, "core_strengths", "resource.editorial")?.map((item, index) => {
    const context = `resource.editorial.core_strengths[${index}]`;
    assertNoUnknownKeys(item, ["title", "description", "why_it_matters"], context);
    return {
      title: requireString(item, "title", context),
      description: requireString(item, "description", context),
      why_it_matters: optionalString(item, "why_it_matters", context)
    };
  });
  const useCaseNotes = optionalRecordArray(input, "use_case_notes", "resource.editorial")?.map((item, index) => {
    const context = `resource.editorial.use_case_notes[${index}]`;
    assertNoUnknownKeys(item, ["title", "description"], context);
    return {
      title: requireString(item, "title", context),
      description: requireString(item, "description", context)
    };
  });
  const compareNotes = optionalRecordArray(input, "compare_notes", "resource.editorial")?.map((item, index) => {
    const context = `resource.editorial.compare_notes[${index}]`;
    assertNoUnknownKeys(item, ["title", "summary", "against"], context);
    return {
      title: requireString(item, "title", context),
      summary: requireString(item, "summary", context),
      against: optionalString(item, "against", context)
    };
  });
  const gettingStarted = optionalRecordArray(input, "getting_started", "resource.editorial")?.map((item, index) => {
    const context = `resource.editorial.getting_started[${index}]`;
    assertNoUnknownKeys(item, ["label", "url", "type"], context);
    const url = requireString(item, "url", context);
    assertUrl(url, `${context}.url`);
    return {
      label: requireString(item, "label", context),
      url,
      type: requireEnum(item, "type", linkTypes, context)
    };
  });
  const commandLine = optionalRecordArray(input, "command_line", "resource.editorial")?.map((item, index) => {
    const context = `resource.editorial.command_line[${index}]`;
    assertNoUnknownKeys(item, ["label", "command", "description"], context);
    return {
      label: requireString(item, "label", context),
      command: requireString(item, "command", context),
      description: optionalString(item, "description", context)
    };
  });
  let seoArticle: EditorialSeoArticle | undefined;
  if (input.seo_article !== undefined) {
    if (!isRecord(input.seo_article)) throw new Error("resource.editorial.seo_article must be an object when present.");
    assertNoUnknownKeys(
      input.seo_article,
      ["intro", "what_it_is", "why_it_matters", "how_it_works", "use_cases", "alternatives", "getting_started", "faq"],
      "resource.editorial.seo_article"
    );
    const seoUseCases = optionalRecordArray(input.seo_article, "use_cases", "resource.editorial.seo_article")?.map((item, index) => {
      const context = `resource.editorial.seo_article.use_cases[${index}]`;
      assertNoUnknownKeys(item, ["title", "description"], context);
      return {
        title: requireString(item, "title", context),
        description: requireString(item, "description", context)
      };
    });
    const seoAlternatives = optionalRecordArray(input.seo_article, "alternatives", "resource.editorial.seo_article")?.map((item, index) => {
      const context = `resource.editorial.seo_article.alternatives[${index}]`;
      assertNoUnknownKeys(item, ["title", "summary", "against"], context);
      return {
        title: requireString(item, "title", context),
        summary: requireString(item, "summary", context),
        against: optionalString(item, "against", context)
      };
    });
    const seoGettingStarted = optionalRecordArray(input.seo_article, "getting_started", "resource.editorial.seo_article")?.map((item, index) => {
      const context = `resource.editorial.seo_article.getting_started[${index}]`;
      assertNoUnknownKeys(item, ["label", "url", "type"], context);
      const url = requireString(item, "url", context);
      assertUrl(url, `${context}.url`);
      return {
        label: requireString(item, "label", context),
        url,
        type: requireEnum(item, "type", linkTypes, context)
      };
    });
    const faq = optionalRecordArray(input.seo_article, "faq", "resource.editorial.seo_article")?.map((item, index) => {
      const context = `resource.editorial.seo_article.faq[${index}]`;
      assertNoUnknownKeys(item, ["question", "answer"], context);
      return {
        question: requireString(item, "question", context),
        answer: requireString(item, "answer", context)
      };
    });
    seoArticle = {
      intro: optionalString(input.seo_article, "intro", "resource.editorial.seo_article"),
      what_it_is: optionalString(input.seo_article, "what_it_is", "resource.editorial.seo_article"),
      why_it_matters: optionalString(input.seo_article, "why_it_matters", "resource.editorial.seo_article"),
      how_it_works: optionalString(input.seo_article, "how_it_works", "resource.editorial.seo_article"),
      use_cases: seoUseCases,
      alternatives: seoAlternatives,
      getting_started: seoGettingStarted,
      faq
    };
  }
  return {
    featured_reason: optionalString(input, "featured_reason", "resource.editorial"),
    trust_note: optionalString(input, "trust_note", "resource.editorial"),
    core_strengths: coreStrengths,
    use_case_notes: useCaseNotes,
    compare_notes: compareNotes,
    getting_started: gettingStarted,
    command_line: commandLine,
    seo_article: seoArticle
  };
}

function parseTimestamps(input: unknown, status: ResourceStatus): ResourceV1["timestamps"] {
  if (!isRecord(input)) {
    if (status === "published") throw new Error("resource.timestamps must be an object.");
    const now = new Date().toISOString();
    return { created_at: now, updated_at: now };
  }
  assertNoUnknownKeys(input, ["created_at", "updated_at", "published_at"], "resource.timestamps");
  return {
    created_at: status === "published" ? requireString(input, "created_at", "resource.timestamps") : (optionalString(input, "created_at", "resource.timestamps") ?? new Date().toISOString()),
    updated_at: status === "published" ? requireString(input, "updated_at", "resource.timestamps") : (optionalString(input, "updated_at", "resource.timestamps") ?? new Date().toISOString()),
    published_at: optionalString(input, "published_at", "resource.timestamps")
  };
}

export function parseResourceV1(input: unknown): ResourceV1 {
  if (!isRecord(input)) {
    throw new Error("Resource must be an object.");
  }
  assertNoUnknownKeys(input, allowedTopLevelKeys, "resource");

  const schemaVersion = requireString(input, "schema_version", "resource");
  if (schemaVersion !== "openagent.resource.v1") {
    throw new Error('resource.schema_version must be "openagent.resource.v1".');
  }
  const status = requireEnum(input, "status", resourceStatuses, "resource");

  return {
    schema_version: "openagent.resource.v1",
    id: requireString(input, "id", "resource"),
    slug: requireString(input, "slug", "resource"),
    status,
    identity: parseIdentity(input.identity, status),
    classification: parseClassification(input.classification, status),
    positioning: parsePositioning(input.positioning),
    decision_signals: parseDecisionSignals(input.decision_signals, status),
    facts: parseFacts(input.facts),
    capabilities: parseCapabilities(input.capabilities),
    links: parseLinks(input.links, status),
    media: parseMedia(input.media),
    tags: parseTags(input.tags, status),
    relationships: parseRelationships(input.relationships),
    machine_readable: parseMachineReadable(input.machine_readable, status),
    seo: parseSeo(input.seo),
    editorial: parseEditorial(input.editorial),
    timestamps: parseTimestamps(input.timestamps, status)
  };
}
