import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-map-gl/mapbox', 'mapbox-gl']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les grandes librairies en chunks distincts
          'mapbox': ['mapbox-gl', 'react-map-gl/mapbox'],
          'deckgl': ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/react', 'deck.gl'],
          'charts': ['echarts', 'echarts-for-react'],
          'utils': ['date-fns', 'zustand', 'clsx']
        }
      }
    },
    // Augmenter la limite avant warning pour les grosses librairies (mapbox, echarts)
    chunkSizeWarningLimit: 2000
  }
})
