import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = process.cwd();
const outputDir = path.join(root, "output");
const stagingDir = path.join(outputDir, "openagent-blog-workbench-local");
const archivePath = path.join(outputDir, "openagent-blog-workbench-local.tar.gz");

const includePaths = [
  "src",
  "functions",
  "content",
  "docs",
  "migrations",
  "public",
  "scripts",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vitest.config.ts",
  "astro.config.mjs",
  "wrangler.toml",
  "README.md",
  ".dev.vars.example",
  "OpenAgent Blog Workbench.command",
  "OpenAgent Blog Workbench.app"
];

async function main() {
  await mkdir(outputDir, { recursive: true });
  await rm(stagingDir, { recursive: true, force: true });
  await rm(archivePath, { force: true });
  await mkdir(stagingDir, { recursive: true });

  await execFileAsync("npm", ["run", "app:macos"], { cwd: root });

  for (const relativePath of includePaths) {
    await cp(path.join(root, relativePath), path.join(stagingDir, relativePath), {
      recursive: true
    });
  }

  const launcher = [
    "#!/usr/bin/env bash",
    "SCRIPT_DIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"",
    "cd \"$SCRIPT_DIR\"",
    "./scripts/start-local-workbench.sh"
  ].join("\n");
  await writeFile(path.join(stagingDir, "OpenAgent Blog Workbench.command"), `${launcher}\n`, { mode: 0o755 });
  await writeFile(path.join(stagingDir, "run-local.sh"), `${launcher}\n`, { mode: 0o755 });

  await execFileAsync("tar", ["-czf", archivePath, "-C", outputDir, path.basename(stagingDir)]);
  console.log(`[package] created ${archivePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
