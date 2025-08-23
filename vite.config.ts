import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    open: true, // Auto-open browser
    cors: true, // Enable CORS
  },
  build: {
    outDir: 'dist', // Build output directory
    assetsDir: 'assets', // Assets directory
    sourcemap: true, // Generate source maps for debugging
    minify: 'terser', // Use terser for minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Add other chunks as needed
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle these dependencies
  },
  css: {
    devSourcemap: true, // CSS source maps in development
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  resolve: {
    alias: {
      '@': '/src', // Path alias for src directory
    },
  },
  preview: {
    port: 4173, // Preview server port
    host: true,
  }
})
