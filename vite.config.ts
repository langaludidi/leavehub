import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@heroicons/react'],
          'affiliate': [
            './src/components/affiliate/AffiliateDashboard',
            './src/components/affiliate/AffiliateSignup',
            './src/components/affiliate/AffiliateAnalytics',
            './src/components/affiliate/AffiliateMarketingMaterials',
            './src/components/affiliate/AffiliatePayments'
          ],
          'whitelabel': [
            './src/components/whitelabel/WhiteLabelDashboard',
            './src/components/whitelabel/WhiteLabelOnboarding',
            './src/components/whitelabel/TenantManagement',
            './src/components/whitelabel/WhiteLabelConfig'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false
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