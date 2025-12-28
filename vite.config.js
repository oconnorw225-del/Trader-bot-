import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Set the root directory where index.html is located
  root: '.',
  
  // Public directory for static assets
  publicDir: 'public',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Ensure compatibility with older browsers
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses (important for Termux)
    strictPort: false,
    open: false,
    cors: true,
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Preview server configuration (for production build preview)
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: false,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@quantum': path.resolve(__dirname, './src/quantum'),
      '@freelance': path.resolve(__dirname, './src/freelance'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
    extensions: ['.js', '.jsx', '.json']
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
    exclude: []
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
  }
});
