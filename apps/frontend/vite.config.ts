import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    fs: { allow: ['..'] } // <- permite importar de fora de apps/frontend
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@agenda-amiga/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
  optimizeDeps: {
    // Ajuda o Vite a não tentar otimizar algo do monorepo como pacote externo
    exclude: ["@agenda-amiga/shared"]
  }
});
