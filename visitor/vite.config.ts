import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // WSL 下 /mnt 盘收不到文件变更通知，改用轮询
    watch: process.env.WSL_DISTRO_NAME ? { usePolling: true, interval: 500 } : undefined,
  },
})
