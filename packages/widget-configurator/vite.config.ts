import { resolve } from 'path';

import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';
import chokidar from 'chokidar';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        base: isDev ? '' : '/dex-widget/',
        define: {
            'process.env': {
                isDev: isDev,
            },
        },
        plugins: [
            react(),
            {
                name: 'watch-lib-files',
                configureServer(server) {
                    chokidar.watch(resolve(__dirname, '..', 'sdk', 'lib')).on('all', () => {
                        server.ws.send({
                            type: 'full-reload',
                            path: '*',
                        });
                    });
                },
            },
        ],
        build: {
            sourcemap: false,
            outDir: 'dist',
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
                ],
            },
            assetsDir: '',
            emptyOutDir: true,
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
        },
    };
});
