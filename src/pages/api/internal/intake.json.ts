import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getRegistryDatabase } from "@/lib/registry/runtime";
import { RegistryIntakeService } from "@/lib/registry/intake";
import { IntakeError } from "@/lib/registry/intake-contract";

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (!env.SYNC_TOKEN || token !== env.SYNC_TOKEN) return respond({ error: "Unauthorized" }, 401);
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new IntakeError("Missing request body");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 180_000) { await reader.cancel(); throw new IntakeError("Request too large", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    const intake = new RegistryIntakeService(getRegistryDatabase());
    if (body.action === "revision") return respond(await intake.revision(String(body.publicationId ?? "")));
    if (body.action === "preview") {
      const result = await intake.preview(body.manifest, body.corrections);
      return respond({ status: result.diff.length ? "pending-review" : "unchanged", slug: result.manifest.entity.slug, revision: result.revision, baseHash: result.baseHash, payloadHash: result.payloadHash, diff: result.diff, corrections: result.corrections, correctionTargets: result.correctionTargets });
    }
    if (body.action === "publish") return respond(await intake.publish(body.manifest, body.baseHash, body.payloadHash, body.reviewer, body.corrections));
    throw new IntakeError("Use preview, publish or revision");
  } catch (error) {
    return respond({ error: error instanceof IntakeError ? error.message : "Invalid request or intake unavailable" }, error instanceof IntakeError ? error.status : 400);
  }
};
