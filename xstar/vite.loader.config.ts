import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function renameHtmlIndex() {
  return {
    name: "rename-html-index",
    writeBundle(options: { dir?: string }) {
      const dir = options.dir ?? path.resolve(process.cwd(), "loader");
      const from = path.join(dir, "loader.html");
      const to = path.join(dir, "index.html");
      if (fs.existsSync(from)) {
        if (fs.existsSync(to)) fs.rmSync(to);
        fs.renameSync(from, to);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), renameHtmlIndex()],
  build: {
    outDir: "loader",
    rollupOptions: {
      input: {
        index: path.resolve(process.cwd(), "loader.html"),
      },
    },
  },
});
