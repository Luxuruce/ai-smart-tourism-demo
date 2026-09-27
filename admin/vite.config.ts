import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 相对路径打包，部署到任意子目录都能用
  base: './',
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    host: '0.0.0.0',
    port: 5174,
    // WSL 下 /mnt 盘收不到文件变更通知，改用轮询
    watch: process.env.WSL_DISTRO_NAME ? { usePolling: true, interval: 500 } : undefined,
  },
})
