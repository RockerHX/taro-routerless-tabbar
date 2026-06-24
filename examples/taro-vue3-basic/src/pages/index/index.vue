<template>
  <view class="fixture-page">
    <text class="fixture-title">{{ activeTitle }}</text>
    <text class="fixture-url">{{ previewUrl }}</text>
    <text class="fixture-retap">{{ retapSummary }}</text>

    <RouterlessTabPaneHost
      :items="tabItems"
      :active="tabs.activeKey.value"
      :visited="tabs.visitedKeys.value"
      pane-class="fixture-routerless-pane"
      hidden-class="fixture-routerless-pane-hidden"
    >
      <template #pane="{ pane, active }">
        <view :class="['fixture-pane', active ? 'fixture-pane-active' : '']">
          <text class="fixture-pane-title">{{ pane.text }}</text>
          <text class="fixture-pane-meta">
            visited: {{ tabs.isVisited(pane.key) ? 'yes' : 'no' }}
          </text>
          <text class="fixture-pane-meta">
            retap refresh count: {{ refreshCounts[pane.key] }}
          </text>
        </view>
      </template>
    </RouterlessTabPaneHost>

    <RouterlessTabBar
      :active="tabs.activeKey.value"
      :items="tabItems"
      :refreshing="refreshingTab"
      :refresh-icon="refreshIcon"
      @change="handleChange"
      @retap="handleRetap"
    />
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  buildRouterlessTabUrl,
  normalizeTabKey,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import { computed, onUnmounted, reactive, ref } from 'vue'

import refreshIcon from '../../assets/tabbar/refresh.svg'
import {
  fixtureRetap,
  useFixtureRetapRefresh,
  useFixtureRetapRefreshAnimation,
} from './retap-refresh'
import { tabItems, tabKeys } from './tabbar'
import type { TabKey } from './tabbar'

const defaultTabKey: TabKey = 'home'

const tabs = useRouterlessTabs({
  tabs: tabItems,
  defaultKey: defaultTabKey,
})
const refreshingTab = ref<TabKey | ''>(fixtureRetap.getAnimatingKey())
const lastRetapTab = ref<TabKey | ''>('')
const refreshCounts = reactive<Record<TabKey, number>>({
  home: 0,
  orders: 0,
  profile: 0,
})
const refreshAnimations = {
  home: useFixtureRetapRefreshAnimation('home'),
  orders: useFixtureRetapRefreshAnimation('orders'),
  profile: useFixtureRetapRefreshAnimation('profile'),
} satisfies Record<TabKey, ReturnType<typeof useFixtureRetapRefreshAnimation>>
const stopWatchingRefreshAnimation = fixtureRetap.subscribeRefreshAnimation(
  (tab) => {
    refreshingTab.value = tab
  },
)
const previewUrl = computed(function getPreviewUrl() {
  return buildRouterlessTabUrl({
    mainPagePath: '/pages/index/index?from=fixture#top',
    tabKey: 'profile',
    query: {
      from: 'smoke',
      lastRetap: lastRetapTab.value || undefined,
    },
  })
})
const activeTitle = computed(function getActiveTitle() {
  return `当前 Tab：${tabs.activeTab.value?.text ?? ''}`
})
const retapSummary = computed(function getRetapSummary() {
  return lastRetapTab.value
    ? `最近刷新：${lastRetapTab.value}`
    : '点击当前 Tab 可触发 retap 刷新'
})

function createRefreshHandler(key: TabKey) {
  return async function refreshFixtureTab() {
    const animation = refreshAnimations[key]

    if (!animation.startRefreshAnimation()) {
      return
    }

    try {
      refreshCounts[key] += 1
      lastRetapTab.value = key
      await Promise.resolve()
    } finally {
      animation.stopRefreshAnimation()
    }
  }
}

useFixtureRetapRefresh('home', createRefreshHandler('home'))
useFixtureRetapRefresh('orders', createRefreshHandler('orders'))
useFixtureRetapRefresh('profile', createRefreshHandler('profile'))

function handleChange(key: TabKey) {
  tabs.activateTab(key)
}

async function handleRetap(key: TabKey) {
  await fixtureRetap.runRefresh(key)
}

useLoad((query: Record<string, string | undefined>) => {
  const nextTab = normalizeTabKey({
    value: String(query.tab ?? ''),
    tabKeys,
    defaultKey: defaultTabKey,
    aliases: {
      index: 'home',
    },
  })

  tabs.activateTab(nextTab)
})

onUnmounted(() => {
  stopWatchingRefreshAnimation()
})
</script>

<style>
.fixture-page {
  --routerless-tabbar-height: 56px;
  --routerless-tabbar-icon-size: 24px;
  --routerless-tabbar-active-color: #f75d5b;
  --routerless-tabbar-bg: #fff;

  min-height: 100vh;
  padding: 32px 24px 112px;
}

.fixture-title,
.fixture-url,
.fixture-retap {
  display: block;
  margin-bottom: 16px;
  color: #1f2329;
  font-size: 28px;
}

.fixture-url,
.fixture-retap {
  color: #4e5969;
  font-size: 22px;
  line-height: 1.5;
  word-break: break-all;
}

.fixture-routerless-pane {
  margin-top: 24px;
}

.fixture-routerless-pane-hidden {
  pointer-events: none;
}

.fixture-pane {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid #edf2fd;
  border-radius: 12px;
  background: #fff;
  color: #4e5969;
}

.fixture-pane-active {
  border-color: #f75d5b;
  color: #f75d5b;
}

.fixture-pane-title,
.fixture-pane-meta {
  display: block;
}

.fixture-pane-title {
  margin-bottom: 12px;
  font-size: 28px;
}

.fixture-pane-meta {
  color: #4e5969;
  font-size: 22px;
  line-height: 1.5;
}
</style>
