import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export const API_URL = "https://cdmock.pythonanywhere.com";

const proxyConfig = {
  target: API_URL,
  secure: false,
  changeOrigin: true,
};

const proxyPaths = [
  "/api",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      ...Object.fromEntries(proxyPaths.map((path) => [path, proxyConfig])),
    },
  },
});
