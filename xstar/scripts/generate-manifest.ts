import fs from "fs";
import path from "path";
import crypto from "crypto";

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

function listFiles(dir: string, base: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = toPosix(path.join(base, entry.name));
    if (entry.isDirectory()) {
      files.push(...listFiles(full, rel));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }
  return files;
}

function hashFile(filePath: string): string {
  const data = fs.readFileSync(filePath);
  const h = crypto.createHash("sha256");
  h.update(data);
  return h.digest("hex");
}

function main() {
  const outDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(outDir)) return;
  const all = listFiles(outDir, "");
  const files = all.filter((p) => toPosix(p) !== "manifest.json");
  const manifest: Record<string, string> = {};
  for (const rel of files) {
    const abs = path.join(outDir, rel);
    manifest[toPosix(rel)] = hashFile(abs);
  }
  const manifestPath = path.join(outDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

main();
