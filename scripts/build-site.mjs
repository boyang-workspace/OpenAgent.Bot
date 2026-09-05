import { access, cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "yup-prototype");
const portalSource = path.join(root, "portal");
const assetSource = path.join(root, "public", "assets");
const output = path.join(root, "dist");
const checkOnly = process.argv.includes("--check");

const contentFiles = {
  stickers: ["id", "name", "category", "image"],
  memes: ["id", "title", "tag", "line", "image"],
  archive: ["id", "title", "year", "discipline", "image"],
  pages: ["type", "title", "description", "path", "keywords"]
};

async function readJson(name) {
  const file = path.join(source, "content", `${name}.json`);
  const parsed = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`${name}.json must contain an array`);
  return parsed;
}

async function validateContent() {
  const collections = Object.fromEntries(await Promise.all(
    Object.entries(contentFiles).map(async ([name, required]) => {
      const items = await readJson(name);
      const ids = new Set();

      for (const [index, item] of items.entries()) {
        for (const field of required) {
          if (typeof item[field] !== "string" || !item[field].trim()) {
            throw new Error(`${name}.json item ${index + 1} is missing ${field}`);
          }
        }
        if (item.id) {
          if (ids.has(item.id)) throw new Error(`${name}.json contains duplicate id ${item.id}`);
          ids.add(item.id);
        }
        if (item.image) await access(path.join(assetSource, "yup", item.image));
      }

      return [name, items];
    })
  ));

  const allowedCategories = new Set(["expressions", "actions", "props"]);
  for (const sticker of collections.stickers) {
    if (!allowedCategories.has(sticker.category)) throw new Error(`Unknown sticker category: ${sticker.category}`);
  }

  return collections;
}

async function validatePages() {
  const htmlFiles = [
    "index.html",
    "origin/index.html",
    "stickers/index.html",
    "memes/index.html",
    "archive/index.html",
    "search/index.html",
    "404.html"
  ];
  await Promise.all(htmlFiles.map(file => access(path.join(source, file))));
  await access(path.join(source, "app.js"));
  await access(path.join(source, "styles.css"));
}

await validateContent();
await validatePages();

if (!checkOnly) {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(portalSource, output, { recursive: true });
  await cp(source, path.join(output, "yup"), {
    recursive: true,
    filter: file => path.basename(file) !== "README.md"
  });
  await cp(assetSource, path.join(output, "assets"), { recursive: true });
  await cp(path.join(source, "favicon.svg"), path.join(output, "favicon.svg"));
  console.log(`Built YUP static site in ${path.relative(root, output)}/`);
} else {
  console.log("YUP content and site structure are valid.");
}
