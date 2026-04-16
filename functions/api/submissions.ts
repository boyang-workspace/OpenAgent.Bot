import { error, hashIp, ok, readJson } from "../_lib/http";
import type { Env } from "../_lib/types";
import { isCategory, stringField, validUrl } from "../_lib/validation";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const input = await readJson(request);

    const trap = stringField(input, "website");
    if (trap) {
      return ok({ accepted: true });
    }

    const projectName = stringField(input, "projectName", { required: true, max: 120 })!;
    const repoUrl = validUrl(stringField(input, "repoUrl", { required: true, max: 300 }), "repoUrl", true)!;
    const homepageUrl = validUrl(stringField(input, "homepageUrl", { max: 300 }), "homepageUrl");
    const category = input.category;
    if (!isCategory(category)) {
      return error("category must be one of models, agents, memory-systems, skills, plugins, or tools.");
    }
    const summary = stringField(input, "summary", { required: true, max: 1200 })!;
    const submitterName = stringField(input, "submitterName", { max: 120 });
    const submitterEmail = stringField(input, "submitterEmail", { max: 160 });

    if (submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      return error("submitterEmail must be a valid email address.");
    }

    if (submitterEmail) {
      const recent = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM submissions WHERE submitter_email = ? AND created_at > datetime('now', '-1 hour')"
      )
        .bind(submitterEmail)
        .first<{ count: number }>();
      if ((recent?.count ?? 0) >= 5) {
        return error("Too many submissions from this email. Please try again later.", 429);
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO submissions (
        id, project_name, repo_url, homepage_url, category, summary,
        submitter_name, submitter_email, status, ip_hash, user_agent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)`
    )
      .bind(
        id,
        projectName,
        repoUrl,
        homepageUrl ?? null,
        category,
        summary,
        submitterName ?? null,
        submitterEmail ?? null,
        await hashIp(request),
        request.headers.get("user-agent"),
        now,
        now
      )
      .run();

    return ok({ id, status: "new" });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Submission failed.");
  }
};
