import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Pre-transform the entry chain at server start so the first browser
    // load doesn't pay the full cold-compile waterfall (large app graph).
    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/AppShell.tsx",
        "./src/pages/HomePage.tsx",
        "./src/pages/QuizFunnelPage.tsx",
      ],
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          // Stable, rarely-changing vendor code split away from app code that
          // changes on every deploy — lets returning visitors reuse a cached
          // vendor chunk instead of re-downloading it after every release.
          if (/react-dom|\/react\/|react-router/.test(id)) return "vendor-react";
          if (/@radix-ui|framer-motion|lucide-react/.test(id)) return "vendor-ui";
          if (id.includes("@supabase")) return "vendor-supabase";
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
