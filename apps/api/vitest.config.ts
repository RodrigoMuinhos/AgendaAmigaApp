import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["../../tsconfig.base.json", "./tsconfig.json"],
    }),
  ],
  resolve: {
    alias: {
      "@agenda-amiga/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    server: {
      deps: {
        inline: ["supertest"],
      },
    },
    coverage: {
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
    },
  },
});
