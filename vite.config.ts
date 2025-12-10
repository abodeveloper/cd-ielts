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
  envDir: false, // Disable .env file loading
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://admin.ieltswonder.uz'),
  },
});
