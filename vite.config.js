import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-serverless-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Handle /api/chat requests locally during development
          const url = req.url?.split('?')[0];
          if (url === '/api/chat') {
            try {
              const { default: handler } = await import('./api/chat.js');
              await handler(req, res);
            } catch (err) {
              console.error('API Dev Middleware Error:', err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Dev Server Error in /api/chat' }));
              }
            }
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
