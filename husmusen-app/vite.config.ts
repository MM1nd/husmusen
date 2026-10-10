import path from "path"
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, import.meta.dirname, 'VITE_')

    if (!env.VITE_GOOGLE_CLIENT_ID?.trim()) {
        throw new Error(
            'Missing VITE_GOOGLE_CLIENT_ID. Set it in husmusen-app/.env.local or the build environment.',
        )
    }

    return {
        plugins: [
            react(),
            babel({ presets: [] }),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                "@": path.resolve(import.meta.dirname, "./src"),
            },
        },
    }
})
