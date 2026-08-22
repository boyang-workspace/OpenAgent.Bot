export type FactObservation = {
  entityId: string;
  sourceId: string;
  factKey: string;
  value: unknown;
  sourceUrl?: string;
  observedAt: string;
};

export type FactChange = {
  changeType: "created" | "updated" | "removed";
  previousValue?: unknown;
  nextValue?: unknown;
};

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalize(item)])
    );
  }
  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export async function factHash(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function deriveFactChange(previousValue: unknown, nextValue: unknown): FactChange | undefined {
  if (previousValue === undefined && nextValue === undefined) return undefined;
  if (previousValue === undefined) return { changeType: "created", nextValue };
  if (nextValue === undefined) return { changeType: "removed", previousValue };
  if (stableStringify(previousValue) === stableStringify(nextValue)) return undefined;
  return { changeType: "updated", previousValue, nextValue };
}
