import { readFileSync } from 'fs';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import path from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
    define: {
        'process.env': {
            WIDGET_VERSION: pkg.version,
        },
    },
    build: {
        minify: 'esbuild',
        outDir: 'lib',
        assetsInlineLimit: 0,
        chunkSizeWarningLimit: 1024,
        lib: {
            entry: 'src/index.ts',
            name: 'Dex-Widget',
            formats: ['es', 'cjs'],
            fileName: (format, name) => `${name}.${format === 'es' ? 'mjs' : format}`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'web3', '@solana/web3.js'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    web3: 'Web3',
                    '@solana/web3.js': 'Web3',
                },
            },
        },
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            outDir: 'lib',
        }),
    ],
});