import { Toast } from "@capacitor/toast";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import axios from "axios";

const REMOTE_BASE_URL = "https://www.miemie.tech/universe/xstar";
type FileEntry = { name: string; type: "file" | "directory" };
const ROOT_DIR = "xstar";

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\/*/, "").replace(/^\.\//, "");
}

function encodePath(p: string): string {
  return normalizePath(p).split("/").map(encodeURIComponent).join("/");
}

async function ensureDir(path: string): Promise<void> {
  await Filesystem.mkdir({
    path,
    directory: Directory.Data,
    recursive: true,
  }).catch(() => {});
}

async function listXstar(path = ""): Promise<FileEntry[]> {
  await ensureDir(ROOT_DIR);
  const p = path ? `${ROOT_DIR}/${path}` : ROOT_DIR;
  const res = await Filesystem.readdir({
    path: p,
    directory: Directory.Data,
  }).catch(() => ({ files: [] as FileEntry[] }));
  return (res.files ?? []) as FileEntry[];
}

export const launchLoader = () => {
  return {
    pullManifest: async () => {
      try {
        const resp = await axios.request<Record<string, string>>({
          baseURL: REMOTE_BASE_URL,
          url: "manifest",
        });
        return resp.data;
      } catch (e) {
        Toast.show({
          text: `拉取失败(${e})`,
        });
      }
    },
    checkFiles: async (
      manifest: Record<string, string>,
      forceAddRoot = false
    ) => {
      const listAllFiles = async (): Promise<string[]> => {
        const out: string[] = [];
        const walk = async (p: string) => {
          const items = await listXstar(p);
          for (const it of items) {
            if (it.type === "directory") {
              const np = p ? `${p}/${it.name}` : it.name;
              await walk(np);
            } else {
              const rp = p ? `${p}/${it.name}` : it.name;
              out.push(rp);
            }
          }
        };
        await walk("");
        return out;
      };
      await ensureDir(ROOT_DIR);
      const missing: string[] = [];
      for (const relRaw of Object.keys(manifest)) {
        const rel = normalizePath(relRaw);
        try {
          const full = `${ROOT_DIR}/${rel}`.replace(/\\/g, "/");
          await Filesystem.stat({ path: full, directory: Directory.Data });
        } catch {
          missing.push(rel);
        }
      }
      // 保证 index.html 被拉去
      // 未来整体做优化，还是要检查文件 tag 更合适
      if (forceAddRoot) {
        missing.push(normalizePath("index.html"));
      }
      const all = await listAllFiles();
      const manifestKeys = new Set(Object.keys(manifest).map(normalizePath));
      const extra = all.filter((f) => !manifestKeys.has(f));
      return {
        ok: !missing.length && !extra.length,
        missing,
        extra,
      };
    },
    deleteExtras: async (extras: string[]) => {
      await ensureDir(ROOT_DIR);
      for (const relRaw of extras) {
        const rel = normalizePath(relRaw);
        const full = `${ROOT_DIR}/${rel}`.replace(/\\/g, "/");
        try {
          const s = await Filesystem.stat({
            path: full,
            directory: Directory.Data,
          });
          const isDir = s.type === "directory";
          if (isDir) {
            await Filesystem.rmdir({
              path: full,
              directory: Directory.Data,
              recursive: true,
            }).catch(() => {});
          } else {
            await Filesystem.deleteFile({
              path: full,
              directory: Directory.Data,
            }).catch(() => {});
          }
        } catch {
          await Filesystem.deleteFile({
            path: full,
            directory: Directory.Data,
          }).catch(() => {});
        }
      }
    },
    downloadMissing: async (missing: string[]) => {
      const writeFileText = async (relRaw: string, text: string) => {
        const rel = normalizePath(relRaw);
        await ensureDir(ROOT_DIR);
        const full = `${ROOT_DIR}/${rel}`.replace(/\\/g, "/");
        const dir = full.split("/").slice(0, -1).join("/");
        if (dir) await ensureDir(dir);
        await Filesystem.writeFile({
          path: full,
          data: text,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
          recursive: true,
        });
      };
      for (const relRaw of missing) {
        try {
          const rel = normalizePath(relRaw);
          const url = `${REMOTE_BASE_URL}/update/${encodePath(rel)}`;
          const resp = await axios.get<string>(url, { responseType: "text" });
          await writeFileText(rel, resp.data);
        } catch (e) {
          void e;
        }
      }
    },
    deleteAll: async () => {
      await ensureDir(ROOT_DIR);
      const items = await listXstar("");
      for (const it of items) {
        const rel = it.name;
        const full = `${ROOT_DIR}/${rel}`.replace(/\\/g, "/");
        if (it.type === "directory") {
          await Filesystem.rmdir({
            path: full,
            directory: Directory.Data,
            recursive: true,
          }).catch(() => {});
        } else {
          await Filesystem.deleteFile({
            path: full,
            directory: Directory.Data,
          }).catch(() => {});
        }
      }
    },
    listAll: async (): Promise<{ files: string[]; dirs: string[] }> => {
      await ensureDir(ROOT_DIR);
      const files: string[] = [];
      const dirs: string[] = [];
      const walk = async (p: string) => {
        const items = await listXstar(p);
        for (const it of items) {
          if (it.type === "directory") {
            const dp = p ? `${p}/${it.name}` : it.name;
            dirs.push(dp);
            await walk(dp);
          } else {
            const fp = p ? `${p}/${it.name}` : it.name;
            files.push(fp);
          }
        }
      };
      await walk("");
      return { files, dirs };
    },
    getIndexUri: async (): Promise<string | null> => {
      try {
        await ensureDir(ROOT_DIR);
        const full = `${ROOT_DIR}/index.html`;
        const res = await Filesystem.getUri({
          path: full,
          directory: Directory.Data,
        });
        const uri = res.uri;
        return uri ?? null;
      } catch {
        return null;
      }
    },
    getRootDirUri: async (): Promise<string | null> => {
      try {
        await ensureDir(ROOT_DIR);
        const res = await Filesystem.getUri({
          path: ROOT_DIR,
          directory: Directory.Data,
        });
        const uri = res.uri;
        if (!uri) return null;
        return uri.endsWith("/") ? uri : `${uri}/`;
      } catch {
        return null;
      }
    },
  };
};
