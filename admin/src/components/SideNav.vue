<script setup lang="ts">
// 侧栏固定 7 项，其中 3 项可点，其余为弱化的不可点文本
const items = [
  { label: '运营驾驶舱', to: '/' },
  { label: '评论明细' },
  { label: '合规自检', to: '/compliance' },
  { label: '工单中心', to: '/tickets' },
  { label: 'AI 问答与知识库' },
  { label: '机位与商户' },
  { label: '数据源' },
]
</script>

<template>
  <nav class="side" aria-label="管理台导航">
    <div class="side__brand serif">青石古镇 · 管理台</div>
    <template v-for="i in items" :key="i.label">
      <RouterLink v-if="i.to" :to="i.to" class="side__item" active-class="" exact-active-class="side__item--on">{{ i.label }}</RouterLink>
      <span v-else class="side__item side__item--off" aria-disabled="true" title="即将上线">{{ i.label }}</span>
    </template>
    <div class="side__gap" />
    <div class="side__note">数据来源：OTA 评论 · 一键反馈工单 · AI 导游问答 · 机位热度</div>
    <div class="side__plan">体验专业版 · 到期 [日期]</div>
  </nav>
</template>

<style scoped>
.side {
  width: 220px; flex-shrink: 0; min-height: 100vh; position: sticky; top: 0; align-self: flex-start;
  background: var(--sidebar-bg); color: var(--sidebar-text); padding: 24px 16px;
  display: flex; flex-direction: column; gap: 6px;
}
.side__brand { font-size: 18px; color: var(--on-color); padding: 0 8px 20px; }
.side__item { padding: 10px 12px; border-radius: 8px; font-size: 14px; color: var(--sidebar-text); }
.side__item:hover { color: var(--on-color); }
.side__item--on { background: var(--primary); color: var(--on-color); font-weight: 700; }
.side__item--off, .side__item--off:hover { color: var(--sidebar-muted); cursor: default; }
.side__gap { flex-grow: 1; }
.side__note { padding: 0 8px; font-size: 12px; line-height: 1.6; color: var(--sidebar-muted); }
.side__plan { padding: 8px 8px 0; font-size: 12px; color: var(--sidebar-muted); }
</style>
