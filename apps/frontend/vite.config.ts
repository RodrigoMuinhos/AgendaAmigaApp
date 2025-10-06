import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@agenda-amiga/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});

