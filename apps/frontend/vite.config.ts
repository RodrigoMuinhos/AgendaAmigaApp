import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// ✅ Configuração otimizada para Vercel + Monorepo
export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  plugins: [
    react(),
    tsconfigPaths(), // lê os aliases direto do tsconfig.json
  ],
  resolve: {
    alias: {
      // acessa o pacote compartilhado entre frontend e backend
      "@agenda-amiga/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
});
