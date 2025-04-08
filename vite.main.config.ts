import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
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
  plugins: [
    // {
    // 	name: "restart",
    // 	closeBundle() {
    // 		process.stdin.emit("data", "rs");
    // 	},
    // },
  ],
});
