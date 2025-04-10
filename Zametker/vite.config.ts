import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      outDir: 'dist',
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'generateSW',
      manifest: {
        id: '/',
        name: 'Zametker',
        short_name: 'Zam',
        description: 'Удобные Zametki прямо под рукой',
        theme_color: '#EBF5FF',
        background_color: '#EBF5FF', 
        display: 'standalone',     
        icons: [
          {
            src: 'assets/logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'assets/logo128.png',
            sizes: '128x128',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'assets/loading_scr_landscape.jpg',
            sizes: '1024x579',
            form_factor: 'wide',
          },
          {
            src: 'assets/loading_scr_portrait.jpg',
            sizes: '445x791',
            form_factor: 'narrow',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,gif}'],
      },
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
