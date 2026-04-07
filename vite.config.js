import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Faster JSX transform — skips the classic runtime overhead
      jsxRuntime: "automatic",
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },

  // Pre-bundle heavy dependencies so Vite doesn't re-process them on every cold start
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "date-fns",
      "react-hot-toast",
      "react-i18next",
      "lucide-react",
    ],
  },

  build: {
    // Keep chunks under 500 KB to avoid huge single files
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps vendor libraries in separate long-lived cache groups
        manualChunks(id) {
          // Core React runtime + Router must stay in the same chunk.
          // react-router-dom (and @remix-run/*) call React.createContext at
          // module-init time, so React must already be evaluated when the
          // router chunk loads. Splitting them into separate chunks causes
          // dsddas
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/@remix-run/")
          ) {
            return "vendor-react";
          }
          // State management
          if (id.includes("node_modules/@reduxjs/") || id.includes("node_modules/react-redux/") || id.includes("node_modules/redux/")) {
            return "vendor-redux";
          }
          // UI / icons
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-lucide";
          }
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Date utilities
          if (id.includes("node_modules/date-fns/")) {
            return "vendor-datefns";
          }
          // i18n
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-i18n";
          }
          // Chart / PDF / heavy utilities — isolated so they don't pollute main bundle
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/jspdf/") ||
            id.includes("node_modules/html2canvas/") ||
            id.includes("node_modules/xlsx/")
          ) {
            return "vendor-heavy";
          }
          // Remaining node_modules — generic vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },

    // Minification
    minify: "esbuild",
    target: "es2020",

    // CSS code splitting — each chunk gets its own CSS file (better caching)
    cssCodeSplit: true,

    // Source maps only in dev
    sourcemap: false,
  },

  preview: {
    allowedHosts: true,
  },

  server: {
    // Faster HMR
    hmr: {
      overlay: true,
    },
    proxy: {
      "/pathao-api": {
        target: "https://api-hermes.pathao.com", // PLEASE DO NOT CHANGE THIS! hermes-api DOES NOT EXIST.
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pathao-api/, ""),
      },
    },
  },
});
