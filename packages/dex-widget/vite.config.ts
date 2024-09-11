import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        define: {
            'process.env': {
                WIDGET_VERSION: '1',
            },
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
                fileName: (format) => {
                    if (format === 'es') {
                        return isDev ? '[name].mjs' : '[name].[hash].mjs';
                    } else if (format === 'cjs') {
                        return isDev ? '[name].js' : '[name].[hash].js';
                    }

                    return '[name].js';
                },
            },
            rollupOptions: {
                external: ['react', 'react-dom', 'web3', '@solana/web3.js'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                        web3: 'Web3',
                        '@solana/web3.js': 'Web3',
                    }
                },
            },
        },
        optimizeDeps: {
            exclude: ['./example/**/*'],
        },
        plugins: [
            dts({
                insertTypesEntry: true,
                outDir: 'lib',
                include: './src/**/*',
            }),
        ],
    };
});
