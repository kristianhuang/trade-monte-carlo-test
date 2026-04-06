import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    hmr: true,
  },

  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
  },

  build: {
    target: "es2015",
    reportCompressedSize: false, // 启用/禁用 gzip 压缩大小报告
    chunkSizeWarningLimit: 1024, // chunk 大小警告的限制（单位kb）
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
