import { json, requireAdmin } from "../../_lib/http";
import type { Env } from "../../_lib/types";
import { audiences, deploymentModes, difficulties, maturities, pricingModels, resourceTypes } from "../../../src/lib/content/resource-schema";
import { taxonomy } from "../../../src/lib/content/taxonomy";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  return json({
    ok: true,
    taxonomy,
    enums: {
      resourceTypes,
      deploymentModes,
      audiences,
      difficulties,
      maturities,
      pricingModels
    },
    rules: {
      publishedResource: {
        requiredTagGroups: ["category", "capability", "constraint", "scenario"],
        minPerGroup: 1,
        maxPerGroup: 5,
        freeFormTagsAllowed: false
      }
    }
  });
};
