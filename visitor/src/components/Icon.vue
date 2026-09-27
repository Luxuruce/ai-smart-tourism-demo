<script setup lang="ts">
import { computed } from 'vue'
import type { TokenName } from '@qs/shared'
import { icons, iconSrc, type IconName } from '@/icons'
import { useThemeStore } from '@/stores/theme'

defineOptions({ options: { virtualHost: true } })

const props = withDefaults(defineProps<{
  name: IconName
  color: TokenName
  /** 设计稿尺寸（px） */
  size?: number
}>(), { size: 24 })

const theme = useThemeStore()

if (import.meta.env.DEV && !(icons[props.name].colors as TokenName[]).includes(props.color)) {
  console.warn(`[Icon] ${props.name} 没有导出 ${props.color} 颜色，请在 src/icons.ts 登记后运行 pnpm gen:icons`)
}

const src = computed(() => iconSrc(props.name, props.color, theme.name))
const style = computed(() => {
  const s = `${(props.size * 750) / 390}rpx`
  return `width:${s};height:${s};flex-shrink:0;display:block;`
})
</script>

<template>
  <image :src="src" :style="style" mode="aspectFit" aria-hidden="true" />
</template>
