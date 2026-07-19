import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
