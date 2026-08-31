import type { APIRoute } from "astro";
import { getRegistryDatabase } from "@/lib/registry/runtime";
import { knowledgeResponse } from "@/lib/registry/knowledge-query";

export const ALL: APIRoute = ({ request }) => knowledgeResponse(request, "history", getRegistryDatabase);
