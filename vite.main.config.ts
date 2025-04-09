import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    conditions: ["node"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["fluent-ffmpeg", "puppeteer", "fsevents", "electron"],
    },
  },
});
