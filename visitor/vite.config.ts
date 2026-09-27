import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    // uni-app 会保留软链接路径，工作区包会被当成 node_modules 依赖缓存、改了不生效；直接指向源码目录
    alias: { '@qs/shared': resolve(__dirname, '../packages/shared/index.ts') },
  },
  // 工作区包是源码，不能被预构建缓存，否则改了 mock 页面看不到
  optimizeDeps: { exclude: ['@qs/shared'] },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // WSL 下 /mnt 盘收不到文件变更通知，改用轮询
    watch: process.env.WSL_DISTRO_NAME ? { usePolling: true, interval: 500 } : undefined,
  },
})
