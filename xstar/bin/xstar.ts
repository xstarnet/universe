#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

function execCmd(command: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command}`));
    });
    child.on("error", reject);
  });
}

function getVersion() {
  try {
    const pkg = require("../package.json");
    return String(pkg.version || "0.0.0");
  } catch {
    return "0.0.0";
  }
}

const program = new Command();
program.name("xstar").description("xstar 命令行工具").version(getVersion());

program
  .command("dev")
  .description("启动开发服务 (pnpm dev)")
  .action(async () => {
    try {
      await execCmd("pnpm dev");
    } catch {
      process.exitCode = 1;
    }
  });

program
  .command("build")
  .description("构建产物 (pnpm build)")
  .action(async () => {
    try {
      await execCmd("pnpm build");
    } catch {
      process.exitCode = 1;
    }
  });

program
  .command("preview")
  .description("预览构建结果 (pnpm preview)")
  .action(async () => {
    try {
      await execCmd("pnpm preview");
    } catch {
      process.exitCode = 1;
    }
  });

program
  .command("schema")
  .description("拉取远程 schema.ts 文件到 ./src/api/")
  .action(async () => {
    const base = "https://www.miemie.tech/universe/schema";
    try {
      const res = await fetch(base);
      if (!res.ok) throw new Error("index not accessible");
      const text = await res.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = undefined;
      }
      let names: string[] = [];
      if (Array.isArray(parsed)) {
        names = parsed.filter(
          (s): s is string => typeof s === "string" && s.endsWith(".ts")
        );
      } else if (typeof parsed === "object" && parsed !== null) {
        const files = (parsed as { files?: unknown }).files;
        if (Array.isArray(files)) {
          names = files.filter(
            (s): s is string => typeof s === "string" && s.endsWith(".ts")
          );
        }
      }
      names = Array.from(new Set(names));
      if (!names.length) throw new Error("no ts files found");
      if (!existsSync(path.resolve("src/api"))) {
        await mkdir(path.resolve("src/api"), { recursive: true });
      }
      for (const name of names) {
        const url = name.startsWith("http")
          ? name
          : `${base}/${name.replace(/^\/+/, "")}`;
        const f = await fetch(url);
        if (!f.ok) throw new Error(`download failed: ${url}`);
        const content = await f.text();
        const dest = path.resolve("src/api", name);
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, content);
        process.stdout.write(`saved: ${dest}\n`);
      }
    } catch (e) {
      process.stderr.write(String(e) + "\n");
      process.exitCode = 1;
    }
  });

program
  .command("version")
  .description("输出当前版本")
  .action(() => {
    process.stdout.write(getVersion() + "\n");
  });

program
  .command("help")
  .description("显示帮助")
  .action(() => {
    program.outputHelp();
  });

program.parse(process.argv);
