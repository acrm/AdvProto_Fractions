import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isProduction = process.env.NODE_ENV === 'production'
const base = isProduction ? '/AdvProto_Fractions/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'AdvProto Fractions',
        short_name: 'Fractions',
        description: 'Advanced Prototype – Fractions learning app',
        start_url: base,
        scope: base,
        display: 'standalone',
        theme_color: '#4a90e2',
        background_color: '#ffffff',
        lang: 'en',
        icons: [
          {
            src: 'icons.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
