export const categories = ["models", "agents", "memory-systems", "skills", "plugins", "tools"] as const;
export const sources = ["github", "hackernews", "producthunt", "x"] as const;
export const projectStatuses = ["draft", "published", "archived"] as const;
export const openSourceStatuses = ["open-source", "open-core", "source-available", "unknown"] as const;

export type CategorySlug = (typeof categories)[number];
export type DiscoverySource = (typeof sources)[number];
export type ProjectStatus = (typeof projectStatuses)[number];
export type OpenSourceStatus = (typeof openSourceStatuses)[number];

export type ProjectCoreStrength = {
  title: string;
  description: string;
  whyItMatters?: string;
};

export type ProjectUseCaseNote = {
  title: string;
  description: string;
};

export type ProjectCompareNote = {
  title: string;
  summary: string;
  against?: string;
};

export type ProjectGettingStarted = {
  label: string;
  url: string;
  type: string;
};

export type ProjectCommandLine = {
  label: string;
  command: string;
  description?: string;
};

export type ProjectFaqItem = {
  question: string;
  answer: string;
};

export type ProjectSeoArticle = {
  intro?: string;
  whatItIs?: string;
  whyItMatters?: string;
  howItWorks?: string;
  useCases?: ProjectUseCaseNote[];
  alternatives?: ProjectCompareNote[];
  gettingStarted?: ProjectGettingStarted[];
  faq?: ProjectFaqItem[];
};

export type ProjectThumbnailBrief = {
  resourceType?: string;
  visualMotif?: string;
  backgroundStyle?: string;
  titleOverlay?: string;
  subtitle?: string;
  priorityAssets?: string[];
  avoid?: string[];
};

export type SourceMetrics = {
  stars?: number;
  forks?: number;
  recentStars?: number;
  hnPoints?: number;
  hnComments?: number;
  productHuntVotes?: number;
  xLikes?: number;
  xReposts?: number;
};

export type DiscoveryCandidate = {
  id: string;
  source: DiscoverySource;
  title: string;
  url: string;
  repoUrl?: string;
  homepageUrl?: string;
  description?: string;
  rawText?: string;
  discoveredAt: string;
  sourceMetrics: SourceMetrics;
  sourceLinks?: string[];
};

export type TopicCandidate = {
  id: string;
  candidateIds: string[];
  topicType: "single-project" | "collection" | "comparison";
  title: string;
  angle: string;
  targetKeyword: string;
  reason: string;
  score: number;
  status: "new" | "drafted" | "ignored";
};

export type OpenProject = {
  slug: string;
  title: string;
  oneLiner: string;
  summary: string;
  whyItMatters: string;
  bestFor: string[];
  notFor?: string[];
  category: CategorySlug;
  tags: string[];
  repoUrl?: string;
  homepageUrl?: string;
  docsUrl?: string;
  demoUrl?: string;
  license?: string;
  maintainer?: string;
  installCommand?: string;
  worksWith?: string[];
  sourceLinks: string[];
  seoTitle: string;
  seoDescription: string;
  shareTitle: string;
  shareDescription: string;
  status: ProjectStatus;
  generatedAt: string;
  reviewedAt?: string;
  updatedAt: string;
  openSourceStatus: OpenSourceStatus;
  isFeatured: boolean;
  isSponsored: boolean;
  featuredReason?: string;
  coverImage?: string;
  coreStrengths?: ProjectCoreStrength[];
  useCaseNotes?: ProjectUseCaseNote[];
  compareNotes?: ProjectCompareNote[];
  gettingStarted?: ProjectGettingStarted[];
  commandLine?: ProjectCommandLine[];
  seoArticle?: ProjectSeoArticle;
  thumbnailBrief?: ProjectThumbnailBrief;
  sourceMetrics?: SourceMetrics;
  noindex?: boolean;
};

export type OpenProjectDraft = OpenProject & {
  status: "draft";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Project field "${key}" must be a non-empty string.`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error(`Project field "${key}" must be a string when present.`);
  }
  return value;
}

function optionalBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new Error(`Project field "${key}" must be a boolean when present.`);
  }
  return value;
}

function requireStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Project field "${key}" must be a string array.`);
  }
  return value;
}

function optionalStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Project field "${key}" must be a string array when present.`);
  }
  return value;
}

function optionalRecordArray(record: Record<string, unknown>, key: string): Record<string, unknown>[] | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => !isRecord(item))) {
    throw new Error(`Project field "${key}" must be an object array when present.`);
  }
  return value;
}

function optionalCoreStrengths(record: Record<string, unknown>): ProjectCoreStrength[] | undefined {
  return optionalRecordArray(record, "coreStrengths")?.map((item) => ({
    title: requireString(item, "title"),
    description: requireString(item, "description"),
    whyItMatters: optionalString(item, "whyItMatters")
  }));
}

function optionalUseCaseNotes(record: Record<string, unknown>): ProjectUseCaseNote[] | undefined {
  return optionalRecordArray(record, "useCaseNotes")?.map((item) => ({
    title: requireString(item, "title"),
    description: requireString(item, "description")
  }));
}

function optionalCompareNotes(record: Record<string, unknown>): ProjectCompareNote[] | undefined {
  return optionalRecordArray(record, "compareNotes")?.map((item) => ({
    title: requireString(item, "title"),
    summary: requireString(item, "summary"),
    against: optionalString(item, "against")
  }));
}

function optionalGettingStarted(record: Record<string, unknown>): ProjectGettingStarted[] | undefined {
  return optionalRecordArray(record, "gettingStarted")?.map((item) => ({
    label: requireString(item, "label"),
    url: requireString(item, "url"),
    type: requireString(item, "type")
  }));
}

function optionalCommandLine(record: Record<string, unknown>): ProjectCommandLine[] | undefined {
  return optionalRecordArray(record, "commandLine")?.map((item) => ({
    label: requireString(item, "label"),
    command: requireString(item, "command"),
    description: optionalString(item, "description")
  }));
}

function optionalSeoArticle(record: Record<string, unknown>): ProjectSeoArticle | undefined {
  const value = record.seoArticle;
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new Error('Project field "seoArticle" must be an object when present.');
  return {
    intro: optionalString(value, "intro"),
    whatItIs: optionalString(value, "whatItIs"),
    whyItMatters: optionalString(value, "whyItMatters"),
    howItWorks: optionalString(value, "howItWorks"),
    useCases: optionalRecordArray(value, "useCases")?.map((item) => ({
      title: requireString(item, "title"),
      description: requireString(item, "description")
    })),
    alternatives: optionalRecordArray(value, "alternatives")?.map((item) => ({
      title: requireString(item, "title"),
      summary: requireString(item, "summary"),
      against: optionalString(item, "against")
    })),
    gettingStarted: optionalRecordArray(value, "gettingStarted")?.map((item) => ({
      label: requireString(item, "label"),
      url: requireString(item, "url"),
      type: requireString(item, "type")
    })),
    faq: optionalRecordArray(value, "faq")?.map((item) => ({
      question: requireString(item, "question"),
      answer: requireString(item, "answer")
    }))
  };
}

function optionalThumbnailBrief(record: Record<string, unknown>): ProjectThumbnailBrief | undefined {
  const value = record.thumbnailBrief;
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new Error('Project field "thumbnailBrief" must be an object when present.');
  return {
    resourceType: optionalString(value, "resourceType"),
    visualMotif: optionalString(value, "visualMotif"),
    backgroundStyle: optionalString(value, "backgroundStyle"),
    titleOverlay: optionalString(value, "titleOverlay"),
    subtitle: optionalString(value, "subtitle"),
    priorityAssets: optionalStringArray(value, "priorityAssets"),
    avoid: optionalStringArray(value, "avoid")
  };
}

function optionalSourceMetrics(record: Record<string, unknown>): SourceMetrics | undefined {
  const value = record.sourceMetrics;
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new Error('Project field "sourceMetrics" must be an object when present.');
  }

  const metrics: SourceMetrics = {};
  for (const key of ["stars", "forks", "recentStars", "hnPoints", "hnComments", "productHuntVotes", "xLikes", "xReposts"] as const) {
    const metric = value[key];
    if (metric === undefined) continue;
    if (typeof metric !== "number") {
      throw new Error(`Project sourceMetrics field "${key}" must be a number when present.`);
    }
    metrics[key] = metric;
  }

  return metrics;
}

function requireEnum<T extends readonly string[]>(record: Record<string, unknown>, key: string, allowed: T): T[number] {
  const value = requireString(record, key);
  if (!allowed.includes(value)) {
    throw new Error(`Project field "${key}" must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

export function parseOpenProject(input: unknown): OpenProject {
  if (!isRecord(input)) {
    throw new Error("Project must be an object.");
  }

  return {
    slug: requireString(input, "slug"),
    title: requireString(input, "title"),
    oneLiner: requireString(input, "oneLiner"),
    summary: requireString(input, "summary"),
    whyItMatters: requireString(input, "whyItMatters"),
    bestFor: requireStringArray(input, "bestFor"),
    notFor: optionalStringArray(input, "notFor"),
    category: requireEnum(input, "category", categories),
    tags: requireStringArray(input, "tags"),
    repoUrl: optionalString(input, "repoUrl"),
    homepageUrl: optionalString(input, "homepageUrl"),
    docsUrl: optionalString(input, "docsUrl"),
    demoUrl: optionalString(input, "demoUrl"),
    license: optionalString(input, "license"),
    maintainer: optionalString(input, "maintainer"),
    installCommand: optionalString(input, "installCommand"),
    worksWith: optionalStringArray(input, "worksWith"),
    sourceLinks: requireStringArray(input, "sourceLinks"),
    seoTitle: requireString(input, "seoTitle"),
    seoDescription: requireString(input, "seoDescription"),
    shareTitle: requireString(input, "shareTitle"),
    shareDescription: requireString(input, "shareDescription"),
    status: requireEnum(input, "status", projectStatuses),
    generatedAt: requireString(input, "generatedAt"),
    reviewedAt: optionalString(input, "reviewedAt"),
    updatedAt: requireString(input, "updatedAt"),
    openSourceStatus: requireEnum(input, "openSourceStatus", openSourceStatuses),
    isFeatured: optionalBoolean(input, "isFeatured") ?? false,
    isSponsored: optionalBoolean(input, "isSponsored") ?? false,
    featuredReason: optionalString(input, "featuredReason"),
    coverImage: optionalString(input, "coverImage"),
    coreStrengths: optionalCoreStrengths(input),
    useCaseNotes: optionalUseCaseNotes(input),
    compareNotes: optionalCompareNotes(input),
    gettingStarted: optionalGettingStarted(input),
    commandLine: optionalCommandLine(input),
    seoArticle: optionalSeoArticle(input),
    thumbnailBrief: optionalThumbnailBrief(input),
    sourceMetrics: optionalSourceMetrics(input),
    noindex: optionalBoolean(input, "noindex")
  };
}
