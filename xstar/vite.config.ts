import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 7319,
      proxy: {
        "/universe": {
          target: "https://www.miemie.tech/universe/",
          // changeOrigin: true,
          headers: {
            origin: "capacitor://localhost",
          },
          secure: false,
          rewrite: (path) => path.replace(/^\/universe/, ""),
        },
      },
    },
  };
});
