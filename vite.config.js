import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@":  path.resolve(import.meta.dirname, 'src'),
        },
    },
    server: {
        hmr: true,
    },

    define: {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
    }
})
