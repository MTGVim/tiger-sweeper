import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Minesweeper PWA',
        short_name: 'Minesweeper',
        display: 'standalone',
        start_url: base,
        scope: base,
        background_color: '#ffffff',
        theme_color: '#111111',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /.*\.(png|jpg|jpeg|svg)/,
            handler: 'CacheFirst'
          },
          {
            urlPattern: /.*\.(js|css)/,
            handler: 'StaleWhileRevalidate'
          }
        ]
      }
    })
  ]
});
