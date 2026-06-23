<template>
  <view class="fixture-page">
    <text class="fixture-title">{{ activeTitle }}</text>
    <text class="fixture-url">{{ previewUrl }}</text>
    <RouterlessTabPaneHost
      :items="tabs.visitedTabs.value"
      :active="tabs.activeKey.value"
      :visited="tabs.visitedKeys.value"
    >
      <template #pane="{ pane, active }">
        <view :class="['fixture-pane', active ? 'fixture-pane-active' : '']">
          <text>{{ pane.text }}</text>
        </view>
      </template>
    </RouterlessTabPaneHost>
    <RouterlessTabBar
      :active="tabs.activeKey.value"
      :items="tabItems"
      @change="handleChange"
    />
  </view>
</template>

<script setup lang="ts">
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  buildRouterlessTabUrl,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import { computed } from 'vue'

const tabItems = [
  { key: 'home', text: '首页' },
  { key: 'orders', text: '订单' },
] as const

type TabKey = (typeof tabItems)[number]['key']

const tabs = useRouterlessTabs({
  tabs: tabItems,
  defaultKey: 'home',
})
const previewUrl = buildRouterlessTabUrl({
  mainPagePath: '/pages/index/index?from=fixture#top',
  tabKey: 'orders',
  query: {
    from: 'smoke',
  },
})
const activeTitle = computed(function getActiveTitle() {
  return `当前 Tab：${tabs.activeTab.value?.text ?? ''}`
})

function handleChange(key: TabKey) {
  tabs.activateTab(key)
}
</script>

<style>
.fixture-page {
  min-height: 100vh;
  padding: 32px 24px 96px;
}

.fixture-title,
.fixture-url {
  display: block;
  margin-bottom: 16px;
  color: #1f2329;
  font-size: 28px;
}

.fixture-pane {
  margin-top: 24px;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  color: #4e5969;
}

.fixture-pane-active {
  color: #f75d5b;
}
</style>
