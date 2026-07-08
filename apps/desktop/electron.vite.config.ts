import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(root, "src/main/index.ts")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(root, "src/preload/index.ts")
      }
    }
  },
  renderer: {
    root: resolve(root, "src/renderer"),
    plugins: [react()],
    resolve: {
      alias: {
        "@renderer": resolve(root, "src/renderer/src"),
        "@shared": resolve(root, "src/shared"),
        "@fashion-design-ai/domain": resolve(root, "../../packages/domain/src/index.ts")
      }
    }
  }
});
