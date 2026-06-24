# Taro Vue3 高级受控 smoke fixture

这个 example 不是最小接入示例，而是仓库内部用于复杂链路验证的高级受控 fixture。它保留 `useRouterlessTabs`、`RouterlessTabPaneHost` 和 `RouterlessTabBar` 手动拼装方式，方便继续做 smoke、runtime 和样式边界验证。

## 覆盖点

- `home`、`orders`、`profile` 三个 Tab。
- `useLoad` 读取 `tab` query，并通过 `getTabKeys` / `normalizeTabKey` 归一化初始 Tab。
- 点击当前 Tab 触发 `retap`，共享 retap context 调用对应刷新 handler。
- 页面展示刷新次数和最近刷新 Tab，便于 smoke 示例可见。
- `iconPath` / `selectedIconPath` 本地图标资源。
- 默认 TabBar CSS 变量覆盖。

## 启动命令

根目录短命令：

```bash
pnpm dev:fixture
pnpm dev:fixture:weapp
pnpm dev:fixture:alipay
```

直接在示例目录运行：

```bash
pnpm --dir examples/taro-vue3-basic run dev:h5
pnpm --dir examples/taro-vue3-basic run dev:weapp
pnpm --dir examples/taro-vue3-basic run dev:alipay
```

## 构建命令

```bash
pnpm --dir examples/taro-vue3-basic run build:h5
pnpm --dir examples/taro-vue3-basic run build:weapp
pnpm --dir examples/taro-vue3-basic run build:alipay
```

根目录也提供封装命令：

```bash
pnpm run test:taro:h5
pnpm run test:taro:weapp
pnpm run test:taro
pnpm run test:taro:h5:runtime
pnpm run test:taro:extended
```
