# Taro Vue3 高级受控 smoke fixture

这个 example 不是最小接入示例，而是仓库内部用于复杂链路验证的高级受控 fixture。它保留 `useRouterlessTabs`、`RouterlessTabPaneHost` 和 `RouterlessTabBar` 手动拼装方式，方便继续做 smoke、runtime 和样式边界验证。

如果只需要可复制的最小接入工程，请优先查看
`examples/taro-vue3-routerless-tabs-basic`。

## 相关文档

- [README](../../README.md)：总导航、示例分层和稳定承诺。
- [完整接入指南](../../doc/integration-guide.md)：高级受控模式的主文档。
- [retap 刷新指南](../../doc/retap-refresh.md)：本 fixture 中 retap 链路的设计说明。
- [样式自定义指南](../../doc/styling.md)：CSS 变量、class 边界和底栏样式说明。
- [多端兼容性说明](../../doc/compatibility.md)：本 fixture 在验证矩阵中的职责。
- [端侧运行时验证矩阵](../../doc/runtime-validation.md)：H5 runtime、WeChat build 和 Alipay extended 的覆盖边界。

## 覆盖点

- `home`、`orders`、`profile` 三个 Tab。
- `useLoad` 读取 `tab` query，并通过 `getTabKeys` / `normalizeTabKey` 归一化初始 Tab。
- 点击当前 Tab 触发 `retap`，由共享 `createRetapRefreshContext` 调用对应 Tab 的刷新 handler。
- 异步 retap loading、success、failure、busy 状态，以及刷新次数和最近刷新 Tab 的可见展示。
- `iconPath` / `selectedIconPath` 本地图标资源。
- `RouterlessTabPaneHost` 的 `hostClass` / `paneClass` / `hiddenClass` 样式边界。
- 长列表和卡片列表底部 padding，用于验证底栏遮挡边界。
- 页面根节点声明底栏 CSS 变量，卡片列表复用同一高度变量验证内容区 padding。
- 复杂 redirect query 预览，覆盖普通 query、旧 `tab` 和 `embedded` 过滤。
- 真实 `Taro.navigateTo` 详情入口，以及 `navigateBack` 返回主容器后的 active Tab / pane 本地状态保留。
- 默认 TabBar CSS 变量覆盖，例如高度、图标尺寸、激活色和背景色。
- H5 自动化 runtime smoke 覆盖初始化、切换、保活、retap、redirect 和真实 `navigateTo` / `navigateBack` 返回链路。

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
