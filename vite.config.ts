import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            if (id.includes('zustand')) {
              return 'store';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
              return 'forms';
            }
            if (
              id.includes('@radix-ui/react-dialog') ||
              id.includes('@radix-ui/react-select') ||
              id.includes('@radix-ui/react-tabs') ||
              id.includes('@radix-ui/react-toast')
            ) {
              return 'ui';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
              return 'utils';
            }
          }
        }
      }
    },
    // Optimasi chunk size
    chunkSizeWarningLimit: 1000,
    // Source maps untuk debugging production
    sourcemap: mode === 'development'
  },
  // Optimasi dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'lucide-react'
    ]
  }
}));
