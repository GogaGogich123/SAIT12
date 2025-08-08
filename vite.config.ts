import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'framer-motion', 
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: false,
    },
    host: true,
    port: 5173,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
