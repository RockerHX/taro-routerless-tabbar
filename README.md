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

## 入口选择

| 入口                               | 适合场景                           | 样式行为                       |
| ---------------------------------- | ---------------------------------- | ------------------------------ |
| `taro-routerless-tabbar`           | 兼容入口，导出全部 API             | 自动引入默认 `style.css`       |
| `taro-routerless-tabbar/core`      | 只使用 URL、key、retap core helper | 不引入 CSS，也不导出 Vue 组件  |
| `taro-routerless-tabbar/vue`       | 使用 Vue composable 或组件         | 不自动引入 CSS                 |
| `taro-routerless-tabbar/style.css` | 配合 `./vue` 入口显式引入默认样式  | 只包含默认底栏和 pane 宿主样式 |

如果只需要 `buildRouterlessTabUrl`、`normalizeTabKey` 等纯 helper，优先从 `taro-routerless-tabbar/core` 导入。使用 `taro-routerless-tabbar/vue` 的默认组件时，请在业务入口显式导入样式：

```ts
import 'taro-routerless-tabbar/style.css'
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
  // 完整刷新链路请按 doc/retap-refresh.md 创建共享单例后调用 runRefresh(tab)
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

- [完整接入指南](doc/integration-guide.md)：`config/tabbar.ts`、main 容器、页面模块 resolver、独立页 redirect。
- [retap 刷新指南](doc/retap-refresh.md)：共享 context、并发刷新、错误处理、动画状态。
- [样式自定义指南](doc/styling.md)：默认样式、`#item` slot、CSS 变量。
- [多端兼容性说明](doc/compatibility.md)：H5 / WeChat 小程序 smoke、复杂页面结构说明。
- [API 文档](doc/api.md)：完整导出、类型、返回值和边界行为。

## 常用 API

| API                            | 说明                                       |
| ------------------------------ | ------------------------------------------ |
| `useRouterlessTabs`            | 管理 active、visited 和点击状态            |
| `RouterlessTabPaneHost`        | 渲染已访问 Tab pane                        |
| `RouterlessTabBar`             | 默认底部 TabBar UI                         |
| `createRetapRefreshContext`    | 创建共享 retap refresh context，含状态查询 |
| `buildRouterlessTabUrl`        | 生成 main 容器 URL                         |
| `resolveStandaloneTabRedirect` | 生成独立 Tab 页重定向 URL                  |
| `resolveTabPageModuleKey`      | 生成或配置 `import.meta.glob` 模块 key     |

## 兼容性与当前状态

- 当前版本：`0.3.2`。
- 目标技术栈：Taro 4、Vue 3、Vite、小程序/H5。
- 当前已覆盖：lint、格式检查、类型检查、单元测试、库构建、pack dry-run、打包后消费侧验证、Taro H5 / WeChat 小程序 smoke build。
- 非目标：不替代 Pinia、Vue Router 或 Taro navigation；暂不承诺 React 支持；暂不承诺所有 Taro 运行端表现完全一致。

源码仓库：https://github.com/RockerHX/taro-routerless-tabbar

npm 包：https://www.npmjs.com/package/taro-routerless-tabbar

## License

MIT
