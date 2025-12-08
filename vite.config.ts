import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["docx"],
  },
  optimizeDeps: {
    include: ["docx"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    commonjsOptions: {
      include: [/docx/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': '"https://admin.ieltswonder.uz"',
  },
  envDir: false, // Disable .env file loading to avoid permission issues
});
