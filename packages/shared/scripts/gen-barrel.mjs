import { promises as fs } from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve("packages/shared/src");
const INDEX_FILE = path.join(SRC_DIR, "index.ts");

function toPascalCase(basename) {
  return basename
    .replace(/\.[tj]s$/, "")
    .split(/[-_ ]+/)
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join("");
}

async function collectTsFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const currentPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectTsFiles(currentPath)));
    } else if (entry.isFile()) {
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      if (entry.name === "index.ts") continue;
      out.push(currentPath);
    }
  }
  return out;
}

function relImport(from, to) {
  const relative = path.relative(path.dirname(from), to).replace(/\\/g, "/");
  const normalized = relative.replace(/\.(ts|tsx)$/, "");
  return relative.startsWith(".") ? normalized : `./${normalized}`;
}

(async () => {
  const files = await collectTsFiles(SRC_DIR);

  const lines = [];
  lines.push("// AUTO-GENERATED BARREL - do not edit by hand");
  lines.push("// Run: node packages/shared/scripts/gen-barrel.mjs");
  lines.push("");

  for (const file of files) {
    const rel = relImport(INDEX_FILE, file);
    const base = path.basename(file);
    const name = toPascalCase(base);
    const source = await fs.readFile(file, "utf8");

    // exporta tudo que for nomeado.
    lines.push(`export * from '${rel}';`);

    // exporta default com nome PascalCase apenas quando presente.
    if (/\bexport\s+default\b/.test(source) || /\bexport\s*{\s*default\s+as\b/.test(source)) {
      lines.push(`export { default as ${name} } from '${rel}';`);
    }

    lines.push("");
  }

  const content = lines.join("\n");
  await fs.writeFile(INDEX_FILE, content, "utf8");
  console.log(`Wrote ${INDEX_FILE} with ${files.length} entries.`);
})();
