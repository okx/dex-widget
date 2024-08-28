import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills({
    include: ['stream'],
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
    protocolImports: true,
  }), react()],
  server: {
    port: 4200,
    host: 'localhost',
  },
})
