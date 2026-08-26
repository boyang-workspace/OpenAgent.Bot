import { entityDomains, type EntityDomain } from "./types";

export function parseEntityDomains(value?: string | null): EntityDomain[] {
  if (!value) return [];
  const parsed = value.split("|").filter((domain): domain is EntityDomain =>
    entityDomains.includes(domain as EntityDomain)
  );
  return [...new Set(parsed)];
}

export function domainLabel(domain: EntityDomain): string {
  if (domain === "robotics") return "Robotics";
  if (domain === "shared-infrastructure") return "Shared infrastructure";
  return "Agent";
}
