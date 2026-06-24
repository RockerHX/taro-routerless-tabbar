# 完整接入指南

本文展示一个 `home`、`order`、`profile` 三个 Tab 的完整接入方式。示例省略业务顶部导航、图片资源和 store，只保留 routerless tab 的核心链路。

## 1. 定义 Tab 配置

```ts
// config/tabbar.ts
import {
  buildRouterlessTabUrl,
  getTabKeys,
  isTabKey as isRouterlessTabKey,
  normalizeTabKey as normalizeRouterlessTabKey,
  resolveTabPageModuleKey,
} from 'taro-routerless-tabbar'

export const mainPagePath = '/pages/main/index'
export const defaultTabKey = 'home'

export const tabbarItems = [
  {
    key: 'home',
    text: '首页',
    pagePath: '/pages/home/index',
    iconPath: '/assets/tabbar/home.png',
    selectedIconPath: '/assets/tabbar/home-active.png',
  },
  {
    key: 'order',
    text: '订单',
    pagePath: '/pages/order/index',
    iconPath: '/assets/tabbar/order.png',
    selectedIconPath: '/assets/tabbar/order-active.png',
  },
  {
    key: 'profile',
    text: '我的',
    pagePath: '/pages/profile/index',
    iconPath: '/assets/tabbar/profile.png',
    selectedIconPath: '/assets/tabbar/profile-active.png',
  },
] as const

export type TabbarItem = (typeof tabbarItems)[number]
export type TabKey = TabbarItem['key']

export const tabKeys = getTabKeys(tabbarItems)

export const isTabKey = (value: string): value is TabKey =>
  isRouterlessTabKey(value, tabKeys)

export const normalizeTabKey = (value: string | undefined): TabKey =>
  normalizeRouterlessTabKey({
    value,
    tabKeys,
    defaultKey: defaultTabKey,
    aliases: {
      index: defaultTabKey,
    },
  })

export const buildMainTabUrl = (tabKey: TabKey = defaultTabKey) =>
  buildRouterlessTabUrl({
    mainPagePath,
    tabKey,
  })

export { resolveTabPageModuleKey }
```

## 2. 创建共享 retap context

如果暂不需要二次点击刷新，也可以先保留这个文件但不在页面注册 handler。需要完整刷新链路时参考 [retap 刷新指南](./retap-refresh.md)。
main 容器和所有 Tab 页面必须引用这个文件导出的同一个实例，不能在页面组件内重新创建 context。

```ts
// pages/main/retap-refresh.ts
import { createRetapRefreshContext } from 'taro-routerless-tabbar'

import type { TabKey } from '@/config/tabbar'

export const tabRetap = createRetapRefreshContext<TabKey>()
export const useTabRetapRefresh = tabRetap.useRetapRefresh
export const useTabRetapRefreshAnimation = tabRetap.useRetapRefreshAnimation
```

## 3. 实现 main 容器页面

main 容器负责解析 URL query、加载业务 Tab 页面组件、维护 active/visited 状态，并渲染默认底栏。

```vue
<!-- pages/main/index.vue -->
<template>
  <view class="page main-page">
    <view class="main-page-content">
      <RouterlessTabPaneHost
        :items="tabPanes"
        :active="activeTab"
        :visited="visitedKeys"
      >
        <template #pane="{ pane, active }">
          <component :is="pane.component" embedded :active="active" />
        </template>
      </RouterlessTabPaneHost>
    </view>

    <RouterlessTabBar
      :active="activeTab"
      :items="tabbarItems"
      :refreshing="refreshingTab"
      refresh-icon="/assets/tabbar/refresh.svg"
      @change="activateTab"
      @retap="handleTabRetap"
    />
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import type { Component } from 'vue'
import { onUnmounted, ref } from 'vue'

import {
  buildMainTabUrl,
  defaultTabKey,
  normalizeTabKey,
  resolveTabPageModuleKey,
  tabbarItems,
} from '@/config/tabbar'
import type { TabKey } from '@/config/tabbar'
import { tabRetap } from '@/pages/main/retap-refresh'

type PageQuery = Record<string, string | undefined>
type TabPageModule = { default: Component }
type TabPane = (typeof tabbarItems)[number] & { component: Component }

const tabPageModules = import.meta.glob<TabPageModule>('../*/index.vue', {
  eager: true,
})

const tabPanes: TabPane[] = tabbarItems.map((item) => {
  const moduleKey = resolveTabPageModuleKey(item.pagePath)
  const pageModule = tabPageModules[moduleKey]

  if (!pageModule) {
    throw new Error(`Missing tab page component: ${item.pagePath}`)
  }

  return {
    ...item,
    component: pageModule.default,
  }
})

const tabs = useRouterlessTabs({
  tabs: tabPanes,
  defaultKey: defaultTabKey,
})
const activeTab = tabs.activeKey
const visitedKeys = tabs.visitedKeys
const activateTab = tabs.activateTab
const refreshingTab = ref<TabKey | ''>(tabRetap.getAnimatingKey())
const stopWatchingRefreshAnimation = tabRetap.subscribeRefreshAnimation(
  (tab) => {
    refreshingTab.value = tab
  },
)

const handleTabRetap = async (tab: TabKey) => {
  await tabRetap.runRefresh(tab)
}

onUnmounted(() => {
  stopWatchingRefreshAnimation()
})

defineOptions({
  onShareAppMessage() {
    return {
      title: '示例应用',
      path: buildMainTabUrl(defaultTabKey),
    }
  },
})

useLoad((query: PageQuery) => {
  activateTab(normalizeTabKey(String(query.tab ?? '')))
})
</script>

<style lang="scss">
.main-page-content {
  min-height: 100vh;
}
</style>
```

## 4. 支持独立 Tab 页面重定向

Tab 页面建议同时支持两种打开方式：

- `embedded=true`：被 main 容器内嵌渲染，参与 routerless Tab 切换和保活。
- `embedded=false`：被独立页面路由打开，此时重定向回 main 容器对应 Tab。

业务项目可以自行封装一个小工具：

```ts
// utils/tab-page.ts
import Taro from '@tarojs/taro'
import { onMounted } from 'vue'
import { buildRouterlessTabUrl } from 'taro-routerless-tabbar'

import { mainPagePath } from '@/config/tabbar'
import type { TabKey } from '@/config/tabbar'

export const useStandaloneTabRedirect = (
  tabKey: TabKey,
  isEmbedded: () => boolean,
) => {
  onMounted(() => {
    if (isEmbedded()) {
      return
    }

    Taro.redirectTo({
      url: buildRouterlessTabUrl({
        mainPagePath,
        tabKey,
      }),
    })
  })
}
```

Tab 页面中按需使用：

```vue
<!-- pages/home/index.vue -->
<template>
  <view v-if="embedded" class="home-page">
    <text>Home active: {{ active }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开首页...</text>
  </view>
</template>

<script setup lang="ts">
import { useStandaloneTabRedirect } from '@/utils/tab-page'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

useStandaloneTabRedirect('home', () => props.embedded)
</script>
```

`order`、`profile` 等其他 Tab 页面保持同样结构，只替换对应 Tab key 和业务内容。需要二次点击刷新时，按 [retap 刷新指南](./retap-refresh.md) 从共享单例文件导入 `useTabRetapRefresh`，不要在每个页面重复创建新的 context。

## 5. 页面模块解析

`import.meta.glob` 必须写在业务项目里：

```ts
const tabPageModules = import.meta.glob('../*/index.vue', {
  eager: true,
})
```

原因是 Vite 需要静态分析 glob 路径，而不同项目的 `pages` 目录结构不一定相同。package 只提供 `resolveTabPageModuleKey` 这类 helper，不会扫描使用者项目目录。

基础项目可以继续使用 `resolveTabPageModuleKey`，它只接受 `/pages/...` 或 `pages/...` 形式，并转换为 main 页面相邻目录可用的 `../xxx/index.vue`。

如果项目使用 subpackages、自定义页面根目录，或 main 页面与 Tab 页面不在同级目录，可以创建自定义 resolver：

```ts
import { createTabPageModuleResolver } from 'taro-routerless-tabbar'

const resolveSubpackageModuleKey = createTabPageModuleResolver({
  pageRoot: '/subpackages/shop/pages',
  modulePrefix: '../../subpackages/shop/pages',
  extension: '.vue',
})

const tabPageModules = import.meta.glob<TabPageModule>(
  '../../subpackages/shop/pages/**/index.vue',
  {
    eager: true,
  },
)

const pageModule =
  tabPageModules[
    resolveSubpackageModuleKey('/subpackages/shop/pages/orders/index')
  ]
```

如果页面路径和 `import.meta.glob` key 不存在稳定推导关系，也可以在业务 Tab 配置中直接声明 `moduleKey`，并优先使用显式配置：

```ts
export const tabbarItems = [
  {
    key: 'order',
    text: '订单',
    pagePath: '/subpackages/shop/pages/order/index',
    moduleKey: '../../subpackages/shop/pages/order/index.vue',
  },
] as const

const tabPanes = tabbarItems.map((item) => {
  const moduleKey = item.moduleKey ?? resolveTabPageModuleKey(item.pagePath)
  const pageModule = tabPageModules[moduleKey]

  if (!pageModule) {
    throw new Error(`Missing tab page component: ${item.pagePath}`)
  }

  return {
    ...item,
    component: pageModule.default,
  }
})
```
