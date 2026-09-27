<script setup lang="ts">
// V1 首页（Main.dc.html）
import { watch } from 'vue'
import type { Route, TokenName } from '@qs/shared'
import type { IconName } from '@/icons'
import Icon from '@/components/Icon.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import FabFeedback from '@/components/FabFeedback.vue'
import { getHomeInfo, getPersonas, getRecommendations } from '@/services/home'
import { usePersonaStore } from '@/stores/persona'
import { go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'


// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })
const { theme, pageStyle, sync } = usePage(true)
const persona = usePersonaStore()

const info = useAsync(getHomeInfo)
const personas = useAsync(getPersonas)
const recs = useAsync(() => getRecommendations(persona.id))
watch(() => persona.id, () => recs.reload())

function toggleTheme() {
  theme.toggle()
  sync()
}

interface GridItem {
  label: string
  bg: TokenName
  icon?: IconName
  color?: TokenName
  /** 没有图标时显示的文字（WC） */
  glyph?: string
  route: Route
}

const grid: GridItem[] = [
  { label: '机位热度', bg: 'heat-high-soft', icon: 'pin', color: 'danger-fg', route: { page: 'map' } },
  { label: '问 AI', bg: 'ok-soft', icon: 'chat-dots', color: 'ok-fg', route: { page: 'guide' } },
  { label: 'AI 行程', bg: 'primary-soft', icon: 'route', color: 'primary-fg', route: { page: 'trip', tripTab: 'plan' } },
  { label: '约观光车', bg: 'primary-soft', icon: 'bus', color: 'primary-fg', route: { page: 'trip', tripTab: 'bus' } },
  { label: '安全求助', bg: 'danger-soft', icon: 'shield-plus', color: 'danger-fg', route: { page: 'sos' } },
  // 研学入口改去文昌阁机位详情，不再直接进入排队页（13.1 1.3）
  { label: '研学任务', bg: 'warn-soft', icon: 'book', color: 'warn-fg', route: { page: 'spot', id: 'wc' } },
  { label: '厕所服务点', bg: 'ink-chip', glyph: 'WC', route: { page: 'map', focus: 'wc1' } },
  { label: '一键反馈', bg: 'surface-muted', icon: 'report', color: 'text', route: { page: 'feedback' } },
]

const openTrip = () => go({ page: 'trip', tripTab: 'plan' })
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="header">
      <view class="header__top">
        <view class="header__title">
          <text class="header__name">{{ info.data.value?.name ?? '青石古镇' }}</text>
          <text class="header__sub">{{ info.data.value?.subtitle }}</text>
        </view>
        <view
          class="theme-btn"
          role="button"
          :aria-label="theme.isDark ? '当前为暗色主题，点击切换到亮色' : '当前为亮色主题，点击切换到暗色'"
          @tap="toggleTheme"
        >
          <Icon :name="theme.isDark ? 'moon' : 'sun'" color="on-color" :size="20" />
        </view>
      </view>
      <view class="info-grid">
        <template v-if="info.data.value">
          <view
            v-for="b in info.data.value.blocks"
            :key="b.label"
            :class="['info-block', { 'info-block--link': b.link }]"
            :role="b.link ? 'link' : undefined"
            @tap="b.link && go(b.link)"
          >
            <text class="info-block__label">{{ b.label }}</text>
            <text class="info-block__value">{{ b.value }}</text>
          </view>
        </template>
        <template v-else>
          <view v-for="i in 3" :key="i" class="info-block info-block--loading" />
        </template>
      </view>
      <view class="search" role="button" aria-disabled="true" aria-label="搜索景点、厕所、美食（即将上线）">
        <Icon name="search" color="on-primary-disabled" :size="18" />
        <text class="search__text">搜索景点、厕所、美食</text>
        <text class="search__tag">即将上线</text>
      </view>
    </view>

    <view class="content">
      <view class="persona">
        <text class="persona__ask">你这次来，主要是为了……</text>
        <StateView :status="personas.status.value" :rows="1" :row-height="36" empty-text="游览身份暂未配置" :error="personas.error.value" @retry="personas.reload">
          <view class="persona__chips" role="radiogroup" aria-label="游览身份">
            <view
              v-for="p in personas.data.value ?? []"
              :key="p.id"
              :class="['chip', { 'chip--on': persona.id === p.id }]"
              role="radio"
              :aria-checked="persona.id === p.id ? 'true' : 'false'"
              @tap="persona.pick(p.id)"
            >{{ p.label }}</view>
          </view>
        </StateView>
      </view>

      <view v-if="info.data.value" class="alert">
        <Icon name="clock" color="warn-fg" :size="20" />
        <view class="alert__body">
          <text class="alert__title">{{ info.data.value.alert.title }}</text>
          <text class="alert__desc">{{ info.data.value.alert.desc }}</text>
          <view class="alert__cta" role="link" @tap="openTrip">{{ info.data.value.alert.cta }}</view>
        </view>
      </view>

      <view class="grid">
        <view v-for="g in grid" :key="g.label" class="tile" role="link" @tap="go(g.route)">
          <view class="tile__icon" :style="`background: var(--${g.bg})`">
            <Icon v-if="g.icon && g.color" :name="g.icon" :color="g.color" :size="22" />
            <text v-else class="tile__glyph">{{ g.glyph }}</text>
          </view>
          <text>{{ g.label }}</text>
        </view>
        <PlaceholderButton shape="tile" icon="scan" label="拍照识建筑" />
        <PlaceholderButton shape="tile" icon="globe" label="多语种" />
      </view>
      <text class="grid-note">虚线图标为即将上线的功能</text>

      <view class="recs-head">
        <text class="recs-head__title">为「{{ persona.label }}」推荐</text>
        <text class="recs-head__sub">按身份和实时人流生成</text>
      </view>
      <StateView :status="recs.status.value" :rows="3" :row-height="68" empty-text="这个身份暂时没有推荐" :error="recs.error.value" @retry="recs.reload">
        <view class="recs">
          <view v-for="r in recs.data.value ?? []" :key="r.title" class="rec" role="link" @tap="go(r.link)">
            <view class="rec__top">
              <text class="rec__title">{{ r.title }}</text>
              <text class="rec__tag">{{ r.tag }}</text>
            </view>
            <text class="rec__desc">{{ r.desc }}</text>
          </view>
        </view>
      </StateView>
    </view>

    <FabFeedback />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: calc(var(--safe-top) + #{r(20)}) r(20) r(16);
  background: var(--primary);
  color: var(--on-color);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.header__top {
  display: flex;
  align-items: flex-start;
  gap: r(12);
}
.header__title {
  display: flex;
  flex-direction: column;
  gap: r(4);
  flex-grow: 1;
}
.header__name {
  @include serif(26);
  letter-spacing: r(2);
  line-height: 1.4;
}
.header__sub {
  font-size: r(12);
  color: var(--on-primary-sub);
}
.theme-btn {
  width: r(44);
  height: r(44);
  border-radius: r(22);
  background: var(--primary-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include tappable;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: r(8);
}
.info-block {
  padding: r(8) r(10);
  border-radius: r(10);
  background: var(--primary-deep);
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.info-block--link {
  @include tappable;
}
.info-block--loading {
  height: r(56);
}
.info-block__label {
  font-size: r(11);
  color: var(--on-primary-sub);
}
.info-block__value {
  font-size: r(14);
  font-weight: 700;
}
.search {
  height: r(44);
  border-radius: r(22);
  border: 1px dashed var(--on-primary-dashed);
  background: var(--primary-deep);
  color: var(--on-primary-disabled);
  font-size: r(14);
  display: flex;
  align-items: center;
  gap: r(8);
  padding: 0 r(14);
  cursor: not-allowed;
}
.search__text {
  flex-grow: 1;
}
.search__tag {
  font-size: r(10);
  padding: r(1) r(6);
  border-radius: r(6);
  background: var(--primary);
}
.content {
  padding: r(14) r(20) r(88);
  display: flex;
  flex-direction: column;
  gap: r(14);
}
.persona {
  display: flex;
  flex-direction: column;
  gap: r(8);
}
.persona__ask {
  font-size: r(13);
  color: var(--text-2);
}
.persona__chips {
  display: flex;
  gap: r(8);
  flex-wrap: wrap;
}
.chip {
  @include pill(36);
  @include tappable;
  padding: 0 r(14);
  font-size: r(13);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-strong);
  // 视觉高 36，点击区扩到 44
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: r(-4);
    bottom: r(-4);
  }
}
.chip--on {
  background: var(--primary);
  color: var(--on-color);
  border-color: var(--primary);
  font-weight: 700;
}
.alert {
  padding: r(12) r(14);
  border-radius: r(14);
  background: var(--warn-soft);
  display: flex;
  gap: r(10);
  align-items: flex-start;
  > :first-child {
    margin-top: r(2);
  }
}
.alert__body {
  display: flex;
  flex-direction: column;
  gap: r(4);
  color: var(--warn-fg);
}
.alert__title {
  font-size: r(14);
  font-weight: 700;
}
.alert__desc {
  font-size: r(12);
  line-height: 1.6;
}
.alert__cta {
  font-size: r(12);
  font-weight: 700;
  min-height: r(32);
  display: flex;
  align-items: center;
  @include tappable;
}
.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: r(4) r(2);
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(6);
  padding: r(6) 0;
  color: var(--text);
  font-size: r(12);
  white-space: nowrap;
  @include tappable;
}
.tile__icon {
  width: r(44);
  height: r(44);
  border-radius: r(14);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tile__glyph {
  color: var(--on-color);
  font-size: r(13);
  font-weight: 700;
}
.grid-note {
  font-size: r(11);
  color: var(--text-disabled);
  margin-top: r(-8);
}
.recs-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: r(8);
}
.recs-head__title {
  font-size: r(16);
  font-weight: 700;
}
.recs-head__sub {
  font-size: r(11);
  color: var(--text-2);
}
.recs {
  display: flex;
  flex-direction: column;
  gap: r(8);
}
.rec {
  padding: r(12) r(14);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: r(12);
  display: flex;
  flex-direction: column;
  gap: r(4);
  @include tappable;
}
.rec__top {
  display: flex;
  align-items: center;
  gap: r(8);
}
.rec__title {
  font-size: r(15);
  font-weight: 700;
  flex-grow: 1;
}
.rec__tag {
  padding: r(2) r(8);
  border-radius: r(8);
  background: var(--ok-soft);
  color: var(--ok-fg);
  font-size: r(11);
  font-weight: 700;
  flex-shrink: 0;
}
.rec__desc {
  font-size: r(12);
  line-height: 1.6;
  color: var(--text-2);
}
</style>
