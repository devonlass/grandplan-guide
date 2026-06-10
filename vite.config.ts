import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy HubSpot API calls to avoid CORS in local dev
      "/api/hubspot": {
        target: "https://api.hubapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hubspot/, ""),
      },
      "/api/news": {
        target: "https://api.rss2json.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, "/v1/api.json"),
      },
      "/api/anthropic": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
