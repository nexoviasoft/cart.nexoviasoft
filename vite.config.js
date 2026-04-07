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
          // ─── Core React runtime ────────────────────────────────────────────
          // react-router-dom, use-sync-external-store, and scheduler all call
          // React internals at module-init time, so they MUST live in the
          // same chunk as React itself.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/@remix-run/") ||
            id.includes("node_modules/use-sync-external-store/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ─── State management ─────────────────────────────────────────────
          if (
            id.includes("node_modules/@reduxjs/") ||
            id.includes("node_modules/react-redux/") ||
            id.includes("node_modules/redux/")
          ) {
            return "vendor-redux";
          }

          // ─── i18n ─────────────────────────────────────────────────────────
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }

          // ─── React ecosystem (all call createContext at init time) ─────────
          // Any package whose name starts with "react-" plus other known
          // context-heavy wrappers. Keeping them together with React avoids
          // "createContext is undefined" errors caused by unpredictable
          // sibling-chunk execution order.
          if (
            /\/node_modules\/react-/.test(id) ||
            id.includes("node_modules/framer-motion/") ||
            id.includes("node_modules/lottie-react/") ||
            id.includes("node_modules/input-otp/") ||
            id.includes("node_modules/@hookform/")
          ) {
            return "vendor-react-deps";
          }

          // ─── UI / icons ───────────────────────────────────────────────────
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-lucide";
          }
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // ─── Date utilities ───────────────────────────────────────────────
          if (id.includes("node_modules/date-fns/")) {
            return "vendor-datefns";
          }

          // ─── Heavy / PDF / chart / spreadsheet ────────────────────────────
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/jspdf/") ||
            id.includes("node_modules/html2canvas/") ||
            id.includes("node_modules/xlsx/")
          ) {
            return "vendor-heavy";
          }

          // ─── Everything else ──────────────────────────────────────────────
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
