import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@heroicons') || id.includes('lucide')) {
              return 'ui-vendor';
            }
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            return 'vendor';
          }
          // Feature-specific chunks
          if (id.includes('affiliate')) {
            return 'affiliate';
          }
          if (id.includes('whitelabel')) {
            return 'whitelabel';
          }
          if (id.includes('components/modals')) {
            return 'modals';
          }
          if (id.includes('components/dashboard')) {
            return 'dashboard';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800, // Increased for larger main chunk
    reportCompressedSize: false,
    minify: true // Use default minification
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});