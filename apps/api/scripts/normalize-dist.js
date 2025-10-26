const fs = require("node:fs");
const path = require("node:path");

const projectRoot = __dirname ? path.join(__dirname, "..") : path.resolve("..");
const distRoot = path.join(projectRoot, "dist");
const nestedSrc = path.join(distRoot, "apps", "api", "src");
const tmpDir = path.join(projectRoot, "__dist_tmp__");

if (!fs.existsSync(nestedSrc)) {
  // Nothing to normalize (already flat or build failed earlier).
  process.exit(0);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
fs.cpSync(nestedSrc, tmpDir, { recursive: true });
fs.rmSync(distRoot, { recursive: true, force: true });
fs.renameSync(tmpDir, distRoot);
