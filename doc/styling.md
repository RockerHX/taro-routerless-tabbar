# 样式自定义指南

`RouterlessTabBar` 是受控展示组件：它只展示当前 active、刷新态和底栏内容，并派发 `change` / `retap` 事件；路由跳转、业务数据刷新和页面布局由业务项目控制。

## 1. 使用默认底栏

```vue
<RouterlessTabBar
  :active="activeTab"
  :items="tabbarItems"
  :refreshing="refreshingTab"
  refresh-icon="/assets/tabbar/refresh.svg"
  @change="activateTab"
  @retap="handleTabRetap"
/>
```

`items` 至少包含 `key` 和 `text`。如果传入 `iconPath` / `selectedIconPath`，默认底栏会按当前 active 状态选择图标：

```ts
export const tabbarItems = [
  {
    key: 'home',
    text: '首页',
    iconPath: '/assets/tabbar/home.png',
    selectedIconPath: '/assets/tabbar/home-active.png',
  },
  {
    key: 'order',
    text: '订单',
    iconPath: '/assets/tabbar/order.png',
    selectedIconPath: '/assets/tabbar/order-active.png',
  },
] as const
```

默认样式会把底栏固定在页面底部，并自动处理安全区：

- 高度变量：`--routerless-tabbar-height`。
- 底部安全区：使用 `constant(safe-area-inset-bottom)` 和 `env(safe-area-inset-bottom)`。
- 层级：`.routerless-tabbar` 默认 `z-index: 20`。

业务页面需要自行给内容区预留底栏空间，避免列表最后一屏被底栏遮挡。例如：

```scss
.main-page-content {
  min-height: 100vh;
  padding-bottom: calc(
    var(--routerless-tabbar-height, 49px) + env(safe-area-inset-bottom)
  );
}
```

## 2. 刷新态图标

当 `refreshing` 等于某个 Tab key 时，该 Tab 会添加 `routerless-tabbar-item-refreshing` 类。如果同时传入 `refresh-icon`，默认内容会展示旋转刷新图标：

```vue
<RouterlessTabBar
  :active="activeTab"
  :items="tabbarItems"
  :refreshing="refreshingTab"
  refresh-icon="/assets/tabbar/refresh.svg"
/>
```

刷新态只表示 UI 动画状态。何时开始、停止动画由业务页面通过 `useTabRetapRefreshAnimation` 控制，详见 [retap 刷新指南](./retap-refresh.md)。

## 3. 使用 slot 完全自定义单个 Tab

需要自定义图标结构、文案、徽标或刷新态时，使用 `#item` 插槽接管单个 Tab 的渲染。

```vue
<RouterlessTabBar
  :active="activeTab"
  :items="tabbarItems"
  :refreshing="refreshingTab"
>
  <template #item="{ item, active, refreshing, iconPath }">
    <view class="my-tabbar-item">
      <image v-if="iconPath" class="my-tabbar-icon" :src="iconPath" />
      <text :class="active ? 'is-active' : ''">
        {{ refreshing ? '刷新中' : item.text }}
      </text>
      <view v-if="item.key === 'order'" class="my-tabbar-badge">3</view>
    </view>
  </template>
</RouterlessTabBar>
```

slot props：

| 名称         | 说明                                       |
| ------------ | ------------------------------------------ |
| `item`       | 当前 Tab 配置项                            |
| `active`     | 当前 Tab 是否激活                          |
| `refreshing` | 当前 Tab 是否处于刷新态                    |
| `iconPath`   | 已按 active 状态解析后的图标路径，可能为空 |

## 4. 使用 CSS 变量覆盖默认样式

默认底栏样式通过 CSS 变量暴露常用视觉项。建议在全局样式或不带 `scoped` 的页面样式里覆盖：

```scss
.routerless-tabbar {
  --routerless-tabbar-height: 52px;
  --routerless-tabbar-icon-size: 28px;
  --routerless-tabbar-text-size: 11px;
  --routerless-tabbar-color: #8a8f99;
  --routerless-tabbar-active-color: #ff4d4f;
  --routerless-tabbar-border-color: #edf2fd;
  --routerless-tabbar-bg: #fff;
}
```

变量列表：

| 变量                               | 默认值    | 说明               |
| ---------------------------------- | --------- | ------------------ |
| `--routerless-tabbar-height`       | `49px`    | 不含安全区的底栏高 |
| `--routerless-tabbar-icon-size`    | `30px`    | 图标和刷新图标尺寸 |
| `--routerless-tabbar-text-size`    | `10px`    | 文案字号           |
| `--routerless-tabbar-color`        | `#888e9b` | 默认文字颜色       |
| `--routerless-tabbar-active-color` | `#f75d5b` | 激活和刷新态颜色   |
| `--routerless-tabbar-border-color` | `#edf2fd` | 顶部分割线颜色     |
| `--routerless-tabbar-bg`           | `#fff`    | 底栏背景           |

如果 SFC 使用 `scoped` 样式，需要按项目构建链支持情况使用深度选择器；更简单的方式是把底栏变量放在页面全局样式或应用全局样式中。

## 5. 何时不用默认样式

默认样式只保证开箱可用。以下场景建议优先通过 `#item` 插槽或业务组件自行实现：

- 需要中间凸起按钮、发布按钮或不等宽 Tab。
- 需要复杂徽标、红点、动效或 Lottie 图标。
- 需要不同端使用完全不同的底栏布局。
- 需要底栏参与页面滚动、吸顶或沉浸式布局。
