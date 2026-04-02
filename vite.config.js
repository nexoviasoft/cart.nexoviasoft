import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },

  optimizeDeps: {
    include: ["react", "react-dom", "date-fns"],
  },

  preview: {
    allowedHosts: true,
  },
  server: {
    proxy: {
      "/pathao-api": {
        target: "https://api-hermes.pathao.com", // PLEASE DO NOT CHANGE THIS! hermes-api DOES NOT EXIST.
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pathao-api/, ""),
      },
    },
  },
});
