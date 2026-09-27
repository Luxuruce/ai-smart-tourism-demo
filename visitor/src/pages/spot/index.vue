<script setup lang="ts">
// V3 机位详情（Spot.dc.html）
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/Icon.vue'
import HeatChip from '@/components/HeatChip.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import { scenarioOfSpot } from '@/services/guide'
import { heatLabel, isCheckin } from '@/services/map'
import { useMapFocusStore } from '@/stores/mapFocus'
import { getSpot } from '@/services/spot'
import { back, go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'

// 页面参数（id）不作为属性透传到根节点
defineOptions({ inheritAttrs: false })

const { pageStyle } = usePage()

const spotId = ref('wc')
const res = useAsync(() => getSpot(spotId.value), { isEmpty: () => false, immediate: false })
onLoad((query) => {
  if (query?.id) spotId.value = String(query.id)
  res.reload()
})

const spot = computed(() => res.data.value)
/** 选中的替代机位，再点一次取消 */
const altId = ref<string | null>(null)
const alt = computed(() => spot.value?.alts?.find((a) => a.id === altId.value) ?? null)

const summary = computed(() => {
  const s = spot.value
  if (!s) return ''
  const parts = []
  if (s.queueCount) parts.push(`约 ${s.queueCount} 人排队`)
  parts.push(s.waitMin === 0 ? '不用等' : `预计 ${s.waitMin} 分钟`)
  if (s.bestLight) parts.push(`最佳光线 ${s.bestLight}（示例）`)
  return parts.join(' · ')
})

const mapFocus = useMapFocusStore()
/** 导航到选中的替代机位：起点为当前机位（14.5） */
function navToAlt() {
  if (!alt.value) return
  mapFocus.requestNav(alt.value.id, spotId.value)
  go({ page: 'map' })
}

function toggleAlt(id: string) {
  altId.value = altId.value === id ? null : id
}
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="photo">
      <view class="photo__ph">
        <Icon name="image" color="text-2" :size="40" />
        <text>[机位样片：踏勘拍摄]</text>
      </view>
      <view class="photo__back" role="button" aria-label="返回地图" @tap="back({ page: 'map' })">
        <Icon name="back" color="text" :size="20" />
      </view>
      <PlaceholderButton
        shape="circle"
        icon="star"
        strong
        aria-label="收藏到我的路线"
        extra-style="position:absolute;top:calc(var(--safe-top) + 14px);right:14px;"
      />
    </view>

    <StateView :status="res.status.value" :rows="3" :row-height="80" :error="res.error.value" @retry="res.reload">
      <view v-if="spot" class="body">
        <view class="info">
          <view class="info__head">
            <text class="info__name">{{ spot.name }}</text>
            <HeatChip :heat="spot.heat" :text="heatLabel(spot.heat)" size="lg" />
          </view>
          <text class="info__sub">{{ summary }}</text>
        </view>

        <view v-if="spot.alts && spot.alts.length" class="card alts">
          <text class="alts__title">不想等 {{ spot.waitMin }} 分钟？这些机位能拍同款</text>
          <view
            v-for="a in spot.alts"
            :key="a.id"
            :class="['alt', { 'alt--on': altId === a.id }]"
            role="radio"
            :aria-checked="altId === a.id ? 'true' : 'false'"
            @tap="toggleAlt(a.id)"
          >
            <view class="alt__thumb">[样片]</view>
            <view class="alt__text">
              <text class="alt__name">{{ a.name }}</text>
              <text class="alt__desc">{{ a.desc }}</text>
              <HeatChip :heat="a.heat" :text="`${heatLabel(a.heat)} · 约 ${a.waitMin} 分钟`" size="sm" />
            </view>
            <view :class="['alt__radio', { 'alt__radio--on': altId === a.id }]" />
          </view>
          <text class="alts__note">按画面相似度推荐；人数上升的机位会暂停推荐，避免新的拥堵。</text>
        </view>

        <view class="links">
          <view class="btn btn--line btn--grow h44 story" role="link" @tap="go({ page: 'guide', q: scenarioOfSpot(spotId) })">
            <Icon name="wave" color="primary-fg" :size="16" />先听这里的故事
          </view>
          <PlaceholderButton label="人少了提醒我 · 即将上线" extra-style="flex:1 1 0;" />
        </view>
      </view>
    </StateView>

    <view class="bottom-bar bar">
      <view v-if="alt" class="bar__row">
        <view class="btn btn--line h52 bar__nav" role="button" @tap="navToAlt">步行导航</view>
        <view class="btn btn--primary h52 bar__main" role="button" @tap="go({ page: 'queue', id: alt.id })">
          去{{ alt.name }}，到了开始{{ isCheckin(alt.waitMin) ? '打卡' : '排队' }}
        </view>
      </view>
      <view v-else class="btn btn--action h52 bar__here" role="button" @tap="go({ page: 'queue', id: spotId })">
        {{ spot && isCheckin(spot.waitMin) ? '我到了，开始打卡' : '我到了，就在这里排队' }}
      </view>
      <text class="bar__note">{{ spot && isCheckin(spot.waitMin) ? '打卡时可以听讲解、做观察小任务' : '排队时会自动播放讲解，还有观察小任务' }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: r(140);
}
.photo {
  height: calc(var(--safe-top) + #{r(200)});
  padding-top: var(--safe-top);
  background: var(--placeholder);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo__ph {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(6);
  color: var(--text-2);
  font-size: r(12);
}
.photo__back {
  position: absolute;
  top: calc(var(--safe-top) + #{r(14)});
  left: r(14);
  width: r(44);
  height: r(44);
  border-radius: r(22);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
.body {
  width: 100%;
}
.info {
  padding: r(16) r(20) r(10);
  display: flex;
  flex-direction: column;
  gap: r(6);
}
.info__head {
  display: flex;
  align-items: center;
  gap: r(10);
}
.info__name {
  @include serif(22);
  flex-grow: 1;
}
.info__sub {
  font-size: r(13);
  color: var(--text-2);
}
.alts {
  margin: 0 r(20);
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.alts__title {
  font-size: r(15);
  font-weight: 700;
}
.alts__note {
  font-size: r(11);
  color: var(--text-2);
}
.alt {
  display: flex;
  gap: r(12);
  align-items: center;
  padding: r(10);
  border-radius: r(12);
  background: var(--surface);
  border: 1px solid var(--surface-muted);
  @include tappable;
}
.alt--on {
  background: var(--primary-soft);
  border: 2px solid var(--primary-fg);
  // 边框变粗时保持内容不跳动
  padding: calc(#{r(10)} - 1px);
}
.alt__thumb {
  width: r(64);
  height: r(64);
  border-radius: r(10);
  background: var(--thumb);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: r(10);
  color: var(--text-2);
}
.alt__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: r(4);
  flex-grow: 1;
}
.alt__name {
  font-size: r(15);
  font-weight: 700;
}
.alt__desc {
  font-size: r(12);
  color: var(--text-2);
}
.alt__radio {
  width: r(20);
  height: r(20);
  border-radius: r(10);
  flex-shrink: 0;
  border: 2px solid var(--border-strong);
}
.alt__radio--on {
  border: 6px solid var(--primary-fg);
}
.links {
  margin: r(10) r(20) 0;
  display: flex;
  gap: r(8);
}
.story {
  gap: r(6);
  font-size: r(13);
}
.bar {
  flex-direction: column;
  gap: r(8);
}
.bar__row {
  display: flex;
  gap: r(8);
}
.bar__nav {
  font-weight: 700;
}
.bar__main {
  flex-grow: 1;
  font-size: r(15);
}
.bar__here {
  font-size: r(16);
}
.bar__note {
  font-size: r(12);
  color: var(--text-2);
  text-align: center;
}
</style>
