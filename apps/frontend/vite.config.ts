import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const devApiTarget = process.env.VITE_DEV_PROXY_TARGET ?? "http://127.0.0.1:3333";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: devApiTarget,
        changeOrigin: true,
      },
      "/socket.io": {
        target: devApiTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  ssr: {
    noExternal: ["@agenda-amiga/shared"],
  },
});
