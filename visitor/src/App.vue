<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { setMockMode, type MockMode } from '@qs/shared'
import { useThemeStore } from '@/stores/theme'

// 小程序端加载标题衬线字体；失败时回退系统字体，不阻塞渲染
const SERIF_FONT_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-sc@latest/chinese-simplified-700-normal.woff2'

onLaunch((options) => {
  // 演示用：?mock=empty / ?mock=error 让所有 services 返回空数据或异常
  const mode = (options?.query as Record<string, string> | undefined)?.mock
  if (mode === 'empty' || mode === 'error') setMockMode(mode as MockMode)

  useThemeStore().applyTabBar()

  // #ifdef MP
  uni.loadFontFace({
    global: true,
    family: 'Noto Serif SC',
    source: `url("${SERIF_FONT_URL}")`,
    desc: { weight: '700', style: 'normal', variant: 'normal' },
    fail: () => {},
  })
  // #endif
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
