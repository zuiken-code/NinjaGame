import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["file.svg", "icons.svg", "file.png"],
      manifest: {
        name: "忍者蹴り",
        short_name: "忍者蹴り",
        description: "天空を目指し、ひたすら蹴り上がれ！手裏剣を避けてどこまで高く登れるか挑戦しよう。",
        theme_color: "#0a0a2e",
        background_color: "#0a0a2e",
        display: "standalone",
        orientation: "portrait",
        scope: "/NinjaGame/",
        start_url: "/NinjaGame/",
        icons: [
          {
            src: "file.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "file.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "file.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "file.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Supabase APIはキャッシュしない
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/www\.googletagmanager\.com\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: "/NinjaGame/",
});
