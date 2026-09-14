import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
    },
    plugins: [svelte()],
    server: {
        proxy: {
            '/ws': {
                target: 'ws://127.0.0.1:8080',
                ws: true,
                rewriteWsOrigin: true,
            },
        },
    },
});
