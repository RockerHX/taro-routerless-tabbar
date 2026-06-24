# Taro Vue3 smoke fixture

用于验证 `taro-routerless-tabbar` 在最小 Taro Vue3 项目中的多端构建。

## 覆盖点

- `home`、`orders`、`profile` 三个 Tab。
- `useLoad` 读取 `tab` query，并通过 `getTabKeys` / `normalizeTabKey` 归一化初始 Tab。
- 点击当前 Tab 触发 `retap`，共享 retap context 调用对应刷新 handler。
- 页面展示刷新次数和最近刷新 Tab，便于 smoke 示例可见。
- `iconPath` / `selectedIconPath` 本地图标资源。
- 默认 TabBar CSS 变量覆盖。

## 构建命令

```bash
pnpm --dir examples/taro-vue3-basic run build:h5
pnpm --dir examples/taro-vue3-basic run build:weapp
```

根目录也提供封装命令：

```bash
pnpm run test:taro:h5
pnpm run test:taro:weapp
pnpm run test:taro
```
