import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/sanctum': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        manifest: true,
        outDir: '../backend/public/build',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'resources/js/app.tsx': path.resolve(__dirname, 'src/main.tsx'),
            },
        },
    },
});
