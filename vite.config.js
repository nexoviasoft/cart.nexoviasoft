import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Keep this minimal (Vite auto handles most deps)
  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core MUST stay together
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom") ||
            id.includes("node_modules/scheduler") ||
            id.includes("node_modules/use-sync-external-store")
          ) {
            return "vendor-react";
          }

          // Redux
          if (
            id.includes("node_modules/@reduxjs") ||
            id.includes("node_modules/react-redux")
          ) {
            return "vendor-redux";
          }

          // i18n
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }

          // Everything else
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },

  server: {
    hmr: {
      overlay: true,
    },
    proxy: {
      "/pathao-api": {
        target: "https://api-hermes.pathao.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pathao-api/, ""),
      },
    },
  },

  preview: {
    allowedHosts: true,
  },
});