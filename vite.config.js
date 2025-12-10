import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173, // Default port, will auto-change if not available
      open: false, // Don't auto-open browser
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://nbn.iotareward.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the /api prefix
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chart library (recharts is large)
          'charts': ['recharts'],
          // Icons library
          'icons': ['lucide-react'],
          // QR Code library
          'qrcode': ['qrcode.react'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit to 600KB to reduce warnings
  },
  }
})
