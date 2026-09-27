<script setup lang="ts">
import SideNav from './components/SideNav.vue'
import { toastText } from './components/toast'
</script>

<template>
  <div class="layout">
    <SideNav />
    <main class="main"><RouterView /></main>
  </div>
  <div v-if="toastText" class="toast" role="status">{{ toastText }}</div>
</template>

<style scoped>
.layout { display: flex; min-width: 1280px; min-height: 100vh; }
.main { flex-grow: 1; min-width: 0; }
.toast {
  position: fixed; left: 50%; top: 24px; transform: translateX(-50%); z-index: 200;
  padding: 10px 18px; border-radius: 10px; background: var(--ink-chip); color: var(--on-color);
  font-size: 14px; box-shadow: var(--shadow-md);
}
</style>
