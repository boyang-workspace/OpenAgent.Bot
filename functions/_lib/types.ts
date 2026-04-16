export type CategorySlug = "models" | "agents" | "memory-systems" | "skills" | "plugins" | "tools";

export type Env = {
  DB: D1Database;
  ADMIN_EMAIL?: string;
  GITHUB_ADMIN_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BASE_BRANCH?: string;
  PUBLIC_SITE_URL?: string;
};

export type PublishPrResult = {
  url: string;
  number: number;
  branch: string;
  commitSha: string;
  filePath: string;
};

export type SubmissionStatus = "new" | "reviewing" | "converted" | "rejected" | "duplicate";
export type DraftStatus = "draft" | "ready" | "pr_created" | "published" | "archived";
export type PublishStatus = "pending" | "running" | "succeeded" | "failed";
export type AdminActor = "human" | "codex" | "automation";

export type Submission = {
  id: string;
  projectName: string;
  repoUrl: string;
  homepageUrl?: string;
  category: CategorySlug;
  summary: string;
  submitterName?: string;
  submitterEmail?: string;
  status: SubmissionStatus;
  draftId?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDraftContent = {
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
  status: "published";
  generatedAt: string;
  reviewedAt: string;
  updatedAt: string;
  openSourceStatus: "open-source" | "open-core" | "source-available" | "unknown";
  isFeatured: boolean;
  isSponsored: boolean;
  featuredReason?: string;
  coverImage?: string;
  noindex?: boolean;
};

export type ProjectDraft = {
  id: string;
  submissionId?: string;
  slug: string;
  title: string;
  category: CategorySlug;
  status: DraftStatus;
  content: ProjectDraftContent;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  commitSha?: string;
  publishStatus?: PublishStatus;
  liveUrl?: string;
  lastPublishPreview?: unknown;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: AdminActor;
  metadata?: unknown;
  before?: unknown;
  after?: unknown;
  result?: unknown;
  error?: string;
  createdAt: string;
};

export type AgentTask = {
  id: string;
  type: "review_submission" | "open_draft" | "complete_draft" | "create_publish_pr" | "check_publish_pr";
  title: string;
  entityType: "submission" | "project_draft";
  entityId: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
  nextEndpoint: string;
};

declare global {
  type PagesFunction<Env = unknown> = (context: {
    request: Request;
    env: Env;
    params: Record<string, string | string[]>;
    waitUntil: (promise: Promise<unknown>) => void;
    next: () => Promise<Response>;
    data: Record<string, unknown>;
  }) => Response | Promise<Response>;

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(columnName?: string): Promise<T | null>;
    all<T = unknown>(): Promise<D1Result<T>>;
    run(): Promise<D1Result>;
  }

  type D1Result<T = unknown> = {
    results?: T[];
    success: boolean;
    meta: Record<string, unknown>;
    error?: string;
  };
}
