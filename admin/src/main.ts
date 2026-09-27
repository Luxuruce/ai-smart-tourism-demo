import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { adminTokens, lightTokens, setMockMode, toCssVars } from '@qs/shared'
import App from './App.vue'
import { router } from './router'
import './styles.css'

// 后台只有亮色：把 token 挂到 :root
document.documentElement.setAttribute('style', toCssVars({ ...lightTokens, ...adminTokens }))

// 演示用：?mock=empty / ?mock=error 让所有 services 返回空数据或异常
const mode = new URLSearchParams(location.search).get('mock')
if (mode === 'empty' || mode === 'error') setMockMode(mode)

createApp(App).use(createPinia()).use(router).mount('#app')
