import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue'), meta: { title: '运营驾驶舱' } },
    { path: '/compliance', name: 'compliance', component: () => import('./views/Compliance.vue'), meta: { title: '合规自检' } },
    { path: '/tickets', name: 'tickets', component: () => import('./views/Tickets.vue'), meta: { title: '工单中心' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? ''} · 青石古镇管理台`
})
