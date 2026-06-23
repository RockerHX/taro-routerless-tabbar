# taro-routerless-tabbar

免路由、不闪烁、保状态的 Taro Vue3 自定义 TabBar 方案。

`taro-routerless-tabbar` 不是一个单纯“画底栏”的 UI 组件库，而是一套把多个 Tab 页面收口到同一个主容器里渲染的 routerless tab 机制。点击 Tab 时不调用 `Taro.switchTab`、`Taro.navigateTo` 或 `Taro.redirectTo`，只更新主容器内部状态。

## 核心能力

- **不走路由切换**：点击不同 Tab 只更新主容器内的 active key。
- **访问后保活**：Tab 首次访问后继续挂载，切走时隐藏而不是卸载。
- **首屏懒挂载**：初始只挂载默认 Tab，其他 Tab 首次访问后再挂载。
- **retap 刷新**：点击当前 Tab 派发 retap，页面自行注册刷新处理器。
- **视觉可控**：提供默认 `RouterlessTabBar`，也支持 slot 和 CSS 变量自定义。

## 适用 / 不适用场景

适合：

- Taro 4 + Vue 3 + Vite 项目。
- 小程序/H5 中希望自定义底栏 UI 的项目。
- 希望 Tab 切换时保留列表滚动、筛选条件或页面局部状态的业务。
- 需要二次点击当前 Tab 触发刷新，并展示刷新态的业务。

不适合：

- 需要完全使用平台原生 `tabBar` 生命周期的项目。
- 希望由本包接管整个 Taro 路由系统的项目。
- React 项目或需要覆盖所有 Taro 运行端的项目。

## 安装

```bash
pnpm add taro-routerless-tabbar
```

## 快速开始

下面示例只展示核心链路：`useRouterlessTabs` 管状态，`RouterlessTabPaneHost` 渲染已访问 pane，`RouterlessTabBar` 展示底栏并派发事件。完整项目通常还会接入 query 解析、`import.meta.glob`、独立页 redirect 和 retap refresh，详见 [完整接入指南](doc/integration-guide.md)。

```vue
<script setup lang="ts">
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import type { Component } from 'vue'

import HomePage from '@/pages/home/index.vue'
import OrderPage from '@/pages/order/index.vue'
import ProfilePage from '@/pages/profile/index.vue'

type TabKey = 'home' | 'order' | 'profile'
type TabPane = {
  key: TabKey
  text: string
  component: Component
  iconPath?: string
  selectedIconPath?: string
}

const tabPanes: TabPane[] = [
  { key: 'home', text: '首页', component: HomePage },
  { key: 'order', text: '订单', component: OrderPage },
  { key: 'profile', text: '我的', component: ProfilePage },
]

const tabs = useRouterlessTabs({
  tabs: tabPanes,
  defaultKey: 'home',
})

const activeTab = tabs.activeKey
const visitedKeys = tabs.visitedKeys
const activateTab = tabs.activateTab

const handleTabRetap = (tab: TabKey) => {
  // 可在这里调用共享 retap context 的 runRefresh(tab)
  console.log('retap tab:', tab)
}
</script>

<template>
  <view class="page main-page">
    <RouterlessTabPaneHost
      :items="tabPanes"
      :active="activeTab"
      :visited="visitedKeys"
    >
      <template #pane="{ pane, active }">
        <component :is="pane.component" embedded :active="active" />
      </template>
    </RouterlessTabPaneHost>

    <RouterlessTabBar
      :active="activeTab"
      :items="tabPanes"
      @change="activateTab"
      @retap="handleTabRetap"
    />
  </view>
</template>
```

## 文档

- [完整接入指南](doc/integration-guide.md)：`config/tabbar.ts`、main 容器、页面模块解析、独立页 redirect。
- [retap 刷新指南](doc/retap-refresh.md)：共享 context、并发刷新、错误处理、动画状态。
- [样式自定义指南](doc/styling.md)：默认样式、`#item` slot、CSS 变量。
- [API 文档](doc/api.md)：完整导出、类型、返回值和边界行为。

## 常用入口

| API                         | 说明                             |
| --------------------------- | -------------------------------- |
| `useRouterlessTabs`         | 管理 active、visited 和点击状态  |
| `RouterlessTabPaneHost`     | 渲染已访问 Tab pane              |
| `RouterlessTabBar`          | 默认底部 TabBar UI               |
| `createRetapRefreshContext` | 创建共享 retap refresh context   |
| `buildRouterlessTabUrl`     | 生成 main 容器 URL               |
| `resolveTabPageModuleKey`   | 生成 `import.meta.glob` 模块 key |

## 兼容性与当前状态

- 当前版本：`0.2.0`。
- 目标技术栈：Taro 4、Vue 3、Vite、小程序/H5。
- 当前已覆盖：lint、格式检查、类型检查、单元测试、库构建、pack dry-run、Taro H5 smoke build。
- 非目标：不替代 Pinia、Vue Router 或 Taro navigation；暂不承诺 React 支持；暂不承诺所有 Taro 运行端表现完全一致。

源码仓库：https://github.com/RockerHX/taro-routerless-tabbar

npm 包：https://www.npmjs.com/package/taro-routerless-tabbar

## License

MIT
