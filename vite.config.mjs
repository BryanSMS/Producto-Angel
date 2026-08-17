import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' recarga el service worker en segundo plano cuando hay
      // una versión nueva del catálogo, sin pedirle nada al usuario.
      registerType: 'autoUpdate',
      includeAssets: [
        'icon.svg',
        'icon-light-32x32.png',
        'icon-dark-32x32.png',
        'apple-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'Producto Angel — Vitrina Digital',
        short_name: 'Producto Angel',
        description: 'Catálogo visual de productos y precios de Producto Angel.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f5f4ef',
        theme_color: '#1f6f5c',
        lang: 'es',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea todo el JS/CSS/HTML del build y las imágenes locales de
        // /public, para que el catálogo cargue completo sin conexión luego
        // de la primera visita.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Fotografías de producto: se sirven de caché si existen y se
            // refrescan en segundo plano cuando hay conexión.
            urlPattern: /\/productos\/.*\.(png|webp|jpg|jpeg)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fotos-productos',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
        ],
      },
      devOptions: {
        // Permite probar el service worker con `npm run dev`.
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
