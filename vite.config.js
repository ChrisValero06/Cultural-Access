import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://culturallaccess.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to the Target:', req.method, req.url);
            console.log('🎯 Target URL:', proxyReq.path);
            console.log('🌐 Full URL:', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
            
            // Agregar headers para evitar problemas de CORS
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
            console.log('📄 Response Content-Type:', proxyRes.headers['content-type']);
            
            // Forzar content-type JSON si es necesario
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
              console.log('⚠️ Server returned HTML, this might be an error page');
            }
          });
        },
      }
    },
    // Configuración adicional para desarrollo
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})
