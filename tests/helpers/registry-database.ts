import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import type { D1Statement, RegistryDatabase } from "../../src/lib/registry/repository";

// Isolated SQLite replay with D1's atomic batch semantics. Never opens .wrangler
// or a production database and never runs a connector/network request.
export function registryTestDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const name of readdirSync("migrations").filter((item) => item.endsWith(".sql")).sort()) db.exec(readFileSync(`migrations/${name}`, "utf8"));
  const adapter: RegistryDatabase = {
    prepare(sql) {
      let bindings: Record<string, SQLInputValue> = {};
      const statement: D1Statement = {
        bind(...values) { bindings = Object.fromEntries(values.map((value, index) => [String(index + 1), value as SQLInputValue])); return statement; },
        async all<T>() { return { success: true, results: db.prepare(sql).all(bindings) as T[] }; },
        async first<T>() { return db.prepare(sql).all(bindings)[0] as T ?? null; },
        async run() { db.prepare(sql).run(bindings); return { success: true }; }
      };
      return statement;
    },
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.run());
        db.exec("COMMIT");
        return result;
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    }
  };
  return { db, adapter };
}
