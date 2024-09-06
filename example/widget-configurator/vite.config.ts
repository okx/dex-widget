import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { existsSync, rmdirSync, watch } from 'fs';
import { execSync } from 'child_process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  const watchDir = resolve(__dirname, '..', '..', 'src');
  const depsCache = resolve(__dirname, 'node_modules/.vite/deps');

  if (isDev) {
    watch(watchDir, { recursive: true }, (_, fileName) => {
      if (fileName && existsSync(depsCache)) {
        console.log(`File changed: ${fileName}`);
        rmdirSync(depsCache, { recursive: true });
        execSync('yalc push', { cwd: '../..' })
        console.log('Cleared Vite deps cache');
      }
    })
  }

  return {
    define: {
      'process.env': {
        isDev: isDev,
      },
    },
    plugins: [react()],
    build: {
      sourcemap: false,
      rollupOptions: {
        plugins: [
          nodePolyfills({
            include: ['stream'],
            globals: {
              Buffer: true,
              global: true,
              process: true,
            },
            protocolImports: true,
          }),
        ]
      }
    },
    server: {
      port: 4200,
      host: 'localhost',
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    optimizeDeps: {
      force: true,
    }
  }
})
