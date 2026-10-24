import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose sur le réseau local
    port: 5173,
  },
  optimizeDeps: {
    // MapLibre v6 worker fails Vite dep pre-bundling → blank map / no MVT requests.
    exclude: ['maplibre-gl'],
  },
})
