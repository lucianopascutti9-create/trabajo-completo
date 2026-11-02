import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Culto al Flan',
        short_name: 'CultoAlFlan',
        description: 'Tienda de postres tradicionales de autor con despacho en el día',
        theme_color: '#78350f',
        background_color: '#faf6f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            // 1. Imágenes de /demo y /static: CacheFirst porque son inmutables
            urlPattern: ({ url }) => url.pathname.startsWith('/demo/') || url.pathname.startsWith('/static/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes-flan-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 2. GET /productos: NetworkFirst para tener el catálogo offline
            urlPattern: ({ url }) => url.pathname.startsWith('/productos'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'catalogo-productos-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})