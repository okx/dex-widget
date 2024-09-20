import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    let switchCount = 0;

    return {
        define: {
            'process.env': {
                WIDGET_VERSION: '1',
            },
            global: "globalThis"
        },
        build: {
            sourcemap: true,
            minify: 'esbuild',
            outDir: 'lib',
            assetsInlineLimit: 0,
            chunkSizeWarningLimit: 1024,
            lib: {
                entry: {
                    index: 'src/index.ts',
                    DexWidgetProvider: 'src/DexWidgetProvider.tsx',
                },
                name: 'Dex-Widget',
                formats: ['es', 'cjs'],
                fileName: (format, name) => {
                    const nonHashName = isDev || name === 'index';

                    if (format === 'es') {
                        return nonHashName ? '[name].mjs' : '[name].[hash].mjs';
                    } else if (format === 'cjs') {
                        return nonHashName ? '[name].js' : '[name].[hash].js';
                    }

                    return '[name].js';
                },
            },
            commonjsOptions: {
                include: [
                    /node_modules/,
                    /@okxweb3\/web3/
                ],
                transformMixedEsModules: true,
                requireReturnsDefault: true,
            },
            rollupOptions: {
                external: ['react', 'react-dom', '@solana/web3.js'],
                output: {
                    exports: 'named',
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                        '@solana/web3.js': 'SolanaWeb3',
                    },
                    chunkFileNames: info => {
                        const ext = info.type === 'chunk' && switchCount % 2 === 0 ? 'js' : 'mjs';
                        switchCount++;
                        return isDev ? `[name].${ext}` : `[name].[hash].${ext}`;
                    }
                },
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
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'SolanaWeb3'],
        },
        plugins: [
            dts({
                insertTypesEntry: true,
                outDir: 'lib',
                include: './src/**/*',
            }),
            commonjs(),
        ],
    };
});
