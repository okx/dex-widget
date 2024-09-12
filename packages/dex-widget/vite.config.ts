import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    let switchCount = 0;

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
            rollupOptions: {
                external: ['react', 'react-dom', 'web3', '@solana/web3.js'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                        web3: 'Web3',
                        '@solana/web3.js': 'Web3',
                    },
                    chunkFileNames: info => {
                        const ext = info.type === 'chunk' && switchCount % 2 === 0 ? 'js' : 'mjs';
                        switchCount++;
                        return isDev ? `[name].${ext}` : `[name].[hash].${ext}`;
                    }
                },
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'web3', '@solana/web3.js'],
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
