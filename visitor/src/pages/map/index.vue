<script setup lang="ts">
// V2 游览地图（Map.dc.html）
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { ServicePoint, ServiceType, Spot, SpotType } from '@qs/shared'
import Icon from '@/components/Icon.vue'
import HeatChip from '@/components/HeatChip.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import FabFeedback from '@/components/FabFeedback.vue'
import {
  distanceValue, focusTarget, getServicePoints, getSpots, glyphOf, heatLabel, serviceTypeOrder, serviceTypes, waitShort,
} from '@/services/map'
import { useMapFocusStore } from '@/stores/mapFocus'
import { usePrefsStore } from '@/stores/prefs'
import { useTripStore } from '@/stores/trip'
import { go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'


// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })
const { theme, pageStyle } = usePage()
const prefs = usePrefsStore()
const trip = useTripStore()
const focus = useMapFocusStore()

const spotsRes = useAsync(getSpots)
const svcRes = useAsync(getServicePoints)

type ScenicFilter = 'all' | SpotType
const view = ref<'map' | 'list'>('map')
const showScenic = ref(true)
const showService = ref(true)
const panel = ref(false)
const filter = ref<ScenicFilter>('all')
const svcTypes = ref<ServiceType[]>([...serviceTypeOrder])
const selLayer = ref<'scenic' | 'service'>('scenic')
const sel = ref('wc')
const svcSel = ref('wc1')

const views = [{ id: 'map', label: '地图' }, { id: 'list', label: '列表' }] as const
const scenicFilters: { id: ScenicFilter; label: string }[] = [
  { id: 'all', label: '全部景点' },
  { id: 'photo', label: '打卡机位' },
  { id: 'story', label: '讲解点' },
]

const allSpots = computed<Spot[]>(() => spotsRes.data.value ?? [])
const allSvc = computed<ServicePoint[]>(() => svcRes.data.value ?? [])
const shownSpots = computed(() =>
  showScenic.value ? allSpots.value.filter((s) => filter.value === 'all' || s.types.includes(filter.value)) : [],
)
const shownSvc = computed(() => (showService.value ? allSvc.value.filter((s) => svcTypes.value.includes(s.type)) : []))
const showRoute = computed(() => showService.value && svcTypes.value.includes('bus'))
const noLayer = computed(() => !showScenic.value && !showService.value)

const selSpot = computed(() => allSpots.value.find((s) => s.id === sel.value) ?? allSpots.value[0])
const selSvc = computed(() => allSvc.value.find((s) => s.id === svcSel.value) ?? allSvc.value[0])
const selScenicVisible = computed(() => selLayer.value === 'scenic' && showScenic.value && !!selSpot.value)
const selServiceVisible = computed(() => selLayer.value === 'service' && showService.value && !!selSvc.value)

// 列表视图：景点按等待时间升序（最多 4 个），设施按距离升序（最多 5 个）
const listSpots = computed(() => [...shownSpots.value].sort((a, b) => a.waitMin - b.waitMin).slice(0, 4))
const listSvc = computed(() => [...shownSvc.value].sort((a, b) => distanceValue(a) - distanceValue(b)).slice(0, 5))

const loadStatus = computed(() => {
  const a = spotsRes.status.value
  const b = svcRes.status.value
  if (a === 'error' || b === 'error') return 'error'
  if (a === 'loading' || b === 'loading') return 'loading'
  if (a === 'empty' && b === 'empty') return 'empty'
  return 'ready'
})
function reload() {
  spotsRes.reload()
  svcRes.reload()
}

function toggleScenic() {
  selLayer.value = showScenic.value ? 'service' : 'scenic'
  showScenic.value = !showScenic.value
}
function toggleService() {
  if (showService.value) selLayer.value = 'scenic'
  showService.value = !showService.value
}
function pickFilter(id: ScenicFilter) {
  filter.value = id
  showScenic.value = true
}
function toggleType(t: ServiceType) {
  svcTypes.value = svcTypes.value.includes(t) ? svcTypes.value.filter((x) => x !== t) : [...svcTypes.value, t]
}
function pickSpot(id: string) {
  selLayer.value = 'scenic'
  sel.value = id
}
function pickSvc(id: string, toMap = false) {
  selLayer.value = 'service'
  svcSel.value = id
  if (toMap) view.value = 'map'
}

// 从其他页跳来时（如安全页「离你最近」），选中指定的景点或设施
onShow(() => {
  const id = focus.take()
  const target = id ? focusTarget(id) : null
  if (!id || !target) return
  view.value = 'map'
  if (target.layer === 'scenic') {
    showScenic.value = true
    filter.value = 'all'
    pickSpot(id)
  } else {
    showService.value = true
    if (!svcTypes.value.includes(target.type)) svcTypes.value = [...svcTypes.value, target.type]
    pickSvc(id)
  }
})

function bookBus() {
  trip.openTab('bus')
  go({ page: 'trip' })
}

const px = (n: number) => `${(n * 750) / 390}rpx`
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <view class="head__title">
        <text class="head__name">游览地图</text>
        <text class="head__sub">热度更新于 3 分钟前 · 示例数据</text>
      </view>
      <view class="seg" role="radiogroup" aria-label="显示方式">
        <view
          v-for="v in views"
          :key="v.id"
          :class="['seg__item', { 'seg__item--on': view === v.id }]"
          role="radio"
          :aria-checked="view === v.id ? 'true' : 'false'"
          @tap="view = v.id"
        >{{ v.label }}</view>
      </view>
    </view>

    <view v-if="!prefs.location" class="loc-tip" role="status">未开启定位，距离为估算</view>

    <view class="layers" role="group" aria-label="地图图层">
      <view :class="['layer', { 'layer--off': !showScenic }]" role="switch" :aria-checked="showScenic ? 'true' : 'false'" @tap="toggleScenic">
        <view class="layer__swatch layer__swatch--scenic" />景点游览
      </view>
      <view :class="['layer', { 'layer--off': !showService }]" role="switch" :aria-checked="showService ? 'true' : 'false'" @tap="toggleService">
        <view class="layer__swatch layer__swatch--service" />服务设施
      </view>
      <view class="layers__gap" />
      <view
        :class="['filter-btn', { 'filter-btn--on': panel }]"
        role="button"
        :aria-expanded="panel ? 'true' : 'false'"
        aria-label="图层与筛选设置"
        @tap="panel = !panel"
      >
        <Icon name="layers" color="text" :size="18" />筛选
      </view>
    </view>

    <StateView :status="loadStatus" :rows="1" :row-height="380" empty-text="地图数据暂时为空" error="地图数据加载失败" @retry="reload">
      <view v-if="view === 'map'" class="map-wrap">
        <view class="map">
          <image class="map__layer" :src="`/static/map/base-${theme.name}.svg`" aria-hidden="true" />
          <image v-if="showRoute" class="map__layer" :src="`/static/map/route-${theme.name}.svg`" aria-hidden="true" />

          <view
            v-for="s in shownSvc"
            :key="s.id"
            class="svc-pin"
            :style="`left:${px(s.x)};top:${px(s.y)}`"
            role="button"
            :aria-label="`${serviceTypes[s.type].label}：${s.name}`"
            :aria-pressed="selLayer === 'service' && svcSel === s.id ? 'true' : 'false'"
            @tap="pickSvc(s.id)"
          >
            <text :class="['svc-pin__icon', { 'svc-pin__icon--on': selLayer === 'service' && svcSel === s.id }]">{{ glyphOf(s) }}</text>
          </view>

          <view
            v-for="s in shownSpots"
            :key="s.id"
            class="pin"
            :style="`left:${px(s.x)};top:${px(s.y)}`"
            role="button"
            :aria-label="`${s.name}，${heatLabel(s.heat)}，${waitShort(s.waitMin)}`"
            :aria-pressed="selLayer === 'scenic' && sel === s.id ? 'true' : 'false'"
            @tap="pickSpot(s.id)"
          >
            <text :class="['pin__bubble', `pin__bubble--${s.heat}`, { 'pin__bubble--on': selLayer === 'scenic' && sel === s.id }]">{{ s.short }} · {{ waitShort(s.waitMin) }}</text>
            <view :class="['pin__dot', `pin__dot--${s.heat}`]" />
          </view>

          <view v-if="noLayer" class="map__empty">已隐藏全部图层，打开上方任一图层</view>

          <PlaceholderButton shape="circle" icon="locate" aria-label="定位到我" extra-style="position:absolute;right:10px;top:10px;" />

          <view v-if="panel" class="panel" role="dialog" aria-label="图层与筛选">
            <view class="panel__head">
              <text class="panel__title">图层与筛选</text>
              <view class="panel__done" role="button" @tap="panel = false">完成</view>
            </view>
            <view class="panel__group">
              <text class="panel__label">景点游览层</text>
              <view class="panel__chips">
                <view
                  v-for="c in scenicFilters"
                  :key="c.id"
                  :class="['fchip', { 'fchip--on': filter === c.id }]"
                  role="radio"
                  :aria-checked="filter === c.id ? 'true' : 'false'"
                  @tap="pickFilter(c.id)"
                >{{ c.label }}</view>
              </view>
            </view>
            <view class="panel__line" />
            <view class="panel__group">
              <text class="panel__label">服务设施层（可多选）</text>
              <view class="panel__chips">
                <view
                  v-for="t in serviceTypeOrder"
                  :key="t"
                  :class="['fchip', { 'fchip--on': svcTypes.includes(t) }]"
                  role="checkbox"
                  :aria-checked="svcTypes.includes(t) ? 'true' : 'false'"
                  @tap="toggleType(t)"
                >
                  <text class="fchip__swatch">{{ serviceTypes[t].glyph }}</text>{{ serviceTypes[t].label }}
                </view>
              </view>
              <view class="panel__legend"><view class="panel__route" />观光车线路（随「观光车」显示）</view>
            </view>
          </view>
        </view>

        <view v-if="selScenicVisible && selSpot" class="card">
          <view class="card__head">
            <text class="card__name">{{ selSpot.name }}</text>
            <HeatChip :heat="selSpot.heat" :text="heatLabel(selSpot.heat)" />
          </view>
          <text class="card__detail">约等 {{ waitShort(selSpot.waitMin) }} · {{ selSpot.detail }}</text>
          <view class="card__actions">
            <view class="btn btn--outline" role="button" @tap="go({ page: 'spot', id: selSpot.id })">查看详情</view>
            <view class="btn btn--action" role="button" @tap="go({ page: 'queue', id: selSpot.id })">我到了，开始排队</view>
          </view>
        </view>

        <view v-if="selServiceVisible && selSvc" class="card">
          <view class="card__head">
            <text class="glyph glyph--30">{{ glyphOf(selSvc) }}</text>
            <text class="card__name">{{ selSvc.name }}</text>
            <text class="card__dist">步行约 {{ selSvc.distance }}</text>
          </view>
          <text class="card__detail">{{ selSvc.detail }}</text>
          <view class="card__actions">
            <view v-if="selSvc.type === 'bus'" class="btn btn--action" role="button" @tap="bookBus">预约观光车</view>
            <view v-else-if="selSvc.type === 'med'" class="btn btn--danger" role="button" @tap="go({ page: 'sos' })">一键求助</view>
            <PlaceholderButton v-else :label="serviceTypes[selSvc.type].placeholder" extra-style="flex:1 1 0;" />
            <view class="btn btn--primary" role="button" @tap="go({ page: 'feedback' })">这里有问题？反馈</view>
          </view>
        </view>
      </view>

      <view v-else class="list">
        <template v-if="showScenic">
          <text class="list__caption">景点 · 按等待时间从短到长</text>
          <view v-if="!listSpots.length" class="list__none">当前筛选下没有景点</view>
          <view v-for="s in listSpots" :key="s.id" class="row" role="link" @tap="go({ page: 'spot', id: s.id })">
            <text class="row__name">{{ s.name }}</text>
            <text class="row__wait">{{ waitShort(s.waitMin) }}</text>
            <HeatChip :heat="s.heat" :text="heatLabel(s.heat)" size="sm" />
          </view>
        </template>
        <template v-if="showService">
          <text class="list__caption list__caption--gap">服务设施 · 按距离从近到远</text>
          <view v-if="!listSvc.length" class="list__none">没有选中的设施类型</view>
          <view v-for="s in listSvc" :key="s.id" class="row row--svc" role="button" @tap="pickSvc(s.id, true)">
            <text class="glyph glyph--28">{{ glyphOf(s) }}</text>
            <text class="row__svc-name">{{ s.name }}</text>
            <text class="row__dist">{{ s.distance }}</text>
          </view>
        </template>
        <view v-if="noLayer" class="list__none">已隐藏全部图层，打开上方任一图层</view>
      </view>
    </StateView>

    <view class="bottom-space" />
    <FabFeedback />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-top: var(--safe-top);
}
.head {
  padding: r(18) r(20) r(10);
  display: flex;
  align-items: center;
  gap: r(12);
}
.head__title {
  display: flex;
  flex-direction: column;
  gap: r(2);
  flex-grow: 1;
}
.head__name {
  @include serif(22);
}
.head__sub {
  font-size: r(12);
  color: var(--text-2);
}
.seg {
  display: flex;
  padding: r(3);
  border-radius: r(20);
  background: var(--surface-muted);
}
.seg__item {
  @include pill(32);
  @include tappable;
  padding: 0 r(14);
  font-size: r(13);
  color: var(--text-2);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: r(-6);
    bottom: r(-6);
  }
}
.seg__item--on {
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
}
.loc-tip {
  margin: 0 r(20) r(10);
  padding: r(8) r(12);
  border-radius: r(10);
  background: var(--warn-soft);
  color: var(--warn-fg);
  font-size: r(12);
}
.layers {
  padding: 0 r(20) r(10);
  display: flex;
  gap: r(8);
  align-items: center;
}
.layers__gap {
  flex-grow: 1;
}
.layer,
.filter-btn {
  @include pill(36);
  @include tappable;
  padding: 0 r(12);
  font-size: r(13);
  gap: r(6);
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
.layer {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--text);
  font-weight: 700;
}
.layer--off {
  background: transparent;
  color: var(--text-disabled);
  border: 1px dashed var(--border-strong);
  font-weight: 400;
  text-decoration: line-through;
}
.layer__swatch--scenic {
  width: r(16);
  height: r(12);
  border-radius: r(6);
  background: var(--heat-high-soft);
  border: 1px solid var(--danger-fg);
}
.layer__swatch--service {
  width: r(14);
  height: r(14);
  border-radius: r(4);
  background: var(--ink-chip);
}
.filter-btn {
  gap: r(4);
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border-strong);
}
.filter-btn--on {
  background: var(--surface-muted);
  border-color: var(--text);
}
.map-wrap {
  width: 100%;
}
.map {
  margin: 0 r(20);
  height: r(380);
  border-radius: r(16);
  background: var(--surface-muted);
  border: 1px solid var(--border);
  overflow: hidden;
  position: relative;
}
.map__layer {
  position: absolute;
  left: 0;
  top: 0;
  width: r(350);
  height: r(380);
}
.svc-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  width: r(44);
  height: r(44);
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
.svc-pin__icon {
  width: r(26);
  height: r(26);
  border-radius: r(7);
  background: var(--ink-chip);
  color: var(--on-color);
  font-size: r(11);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface);
  box-sizing: border-box;
}
.svc-pin__icon--on {
  width: r(32);
  height: r(32);
  border-color: var(--action-fg);
}
.pin {
  position: absolute;
  transform: translate(-50%, -100%);
  min-height: r(44);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(2);
  @include tappable;
}
.pin__bubble {
  padding: r(4) r(8);
  border-radius: r(10);
  font-size: r(12);
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid var(--surface);
}
.pin__bubble--on {
  border: 2px solid var(--text);
}
.pin__bubble--high { background: var(--heat-high-soft); color: var(--danger-fg); }
.pin__bubble--mid { background: var(--warn-soft); color: var(--warn-fg); }
.pin__bubble--low { background: var(--ok-soft); color: var(--ok-fg); }
.pin__dot {
  width: r(10);
  height: r(10);
  border-radius: r(5);
  border: 2px solid var(--surface);
  box-sizing: content-box;
}
.pin__dot--high { background: var(--heat-high-dot); }
.pin__dot--mid { background: var(--heat-mid-dot); }
.pin__dot--low { background: var(--heat-low-dot); }
.map__empty {
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  padding: r(10) r(14);
  border-radius: r(12);
  background: var(--surface);
  font-size: r(13);
  color: var(--text-2);
  white-space: nowrap;
}
.panel {
  position: absolute;
  left: r(10);
  right: r(10);
  top: r(10);
  z-index: 5;
  padding: r(14);
  border-radius: r(14);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.panel__head {
  display: flex;
  align-items: center;
}
.panel__title {
  font-size: r(15);
  font-weight: 700;
  flex-grow: 1;
}
.panel__done {
  min-height: r(36);
  padding: 0 r(8);
  color: var(--primary-fg);
  font-size: r(14);
  display: flex;
  align-items: center;
  @include tappable;
}
.panel__group {
  display: flex;
  flex-direction: column;
  gap: r(8);
}
.panel__label {
  font-size: r(12);
  color: var(--text-2);
}
.panel__chips {
  display: flex;
  gap: r(8);
  flex-wrap: wrap;
}
.panel__line {
  height: 1px;
  background: var(--surface-muted);
}
.panel__legend {
  display: flex;
  align-items: center;
  gap: r(8);
  font-size: r(12);
  color: var(--text-2);
}
.panel__route {
  width: r(28);
  height: 0;
  border-top: 3px dashed var(--primary-fg);
}
.fchip {
  @include pill(36);
  @include tappable;
  padding: 0 r(12);
  font-size: r(13);
  gap: r(6);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-strong);
}
.fchip--on {
  background: var(--ink-chip);
  color: var(--on-color);
  border-color: var(--text);
  font-weight: 700;
}
.fchip__swatch {
  min-width: r(18);
  height: r(18);
  padding: 0 r(3);
  box-sizing: border-box;
  border-radius: r(5);
  font-size: r(10);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-chip);
  color: var(--on-color);
}
.fchip--on .fchip__swatch {
  background: var(--surface);
  color: var(--text);
}
.card {
  margin: r(12) r(20) 0;
  padding: r(14) r(16);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
  box-shadow: var(--shadow-sm);
}
.card__head {
  display: flex;
  align-items: center;
  gap: r(10);
}
.card__name {
  font-size: r(17);
  font-weight: 700;
  flex-grow: 1;
}
.card__dist {
  font-size: r(12);
  color: var(--text-2);
}
.card__detail {
  font-size: r(13);
  color: var(--text-2);
}
.card__actions {
  display: flex;
  gap: r(8);
}
.btn {
  @include pill(44);
  @include tappable;
  flex: 1 1 0;
  font-size: r(14);
  font-weight: 700;
}
.btn--outline {
  border: 1px solid var(--primary-fg);
  color: var(--primary-fg);
}
.btn--action {
  background: var(--action);
  color: var(--on-color);
}
.btn--danger {
  background: var(--danger);
  color: var(--on-color);
}
.btn--primary {
  background: var(--primary);
  color: var(--on-color);
}
.glyph {
  border-radius: r(8);
  background: var(--ink-chip);
  color: var(--on-color);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.glyph--30 {
  width: r(30);
  height: r(30);
  font-size: r(13);
}
.glyph--28 {
  width: r(28);
  height: r(28);
  font-size: r(12);
}
.list {
  padding: 0 r(20);
  display: flex;
  flex-direction: column;
  gap: r(8);
}
.list__caption {
  font-size: r(12);
  color: var(--text-2);
}
.list__caption--gap {
  margin-top: r(4);
}
.list__none {
  padding: r(12) r(14);
  border-radius: r(12);
  border: 1px dashed var(--border-strong);
  font-size: r(13);
  color: var(--text-2);
}
.row {
  display: flex;
  align-items: center;
  gap: r(12);
  padding: r(10) r(14);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: r(12);
  min-height: r(44);
  @include tappable;
}
.row--svc {
  padding: r(8) r(14);
}
.row__name {
  font-size: r(15);
  font-weight: 700;
  flex-grow: 1;
}
.row__wait {
  font-size: r(16);
  font-weight: 700;
}
.row__svc-name {
  font-size: r(14);
  font-weight: 700;
  flex-grow: 1;
}
.row__dist {
  font-size: r(12);
  color: var(--text-2);
}
.bottom-space {
  height: r(88);
}
</style>
