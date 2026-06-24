# 项目现状分析与 0.3.x 路线图

生成日期：2026-06-24  
当前版本：`0.2.3`

## 结论

前一阶段的发布前收敛工作已经完成：README 已拆分，retap 示例已改成共享 context，`./core` / `./vue` / `./style.css` 子路径导出已落地，Taro H5 + WeChat 小程序 smoke build 已纳入验证，页面模块 resolver 也已支持复杂目录结构。

0.3.x 不建议继续大改核心 routerless 模型，而应围绕“消费侧稳定性”和“接入样板沉淀”推进：让 npm 包在真实使用者项目中的类型、导出、样式、redirect 和发布流程更可验证、更少靠文档口头约定。

## 当前已验证基线

| 检查项               | 命令                                | 当前状态                             |
| -------------------- | ----------------------------------- | ------------------------------------ |
| ESLint               | `pnpm run lint`                     | 已纳入脚本/CI                        |
| Prettier             | `pnpm run format:check`             | 已纳入脚本/CI                        |
| TypeScript           | `pnpm run typecheck`                | 已纳入脚本/CI                        |
| 单元测试             | `pnpm run test:run`                 | 已纳入脚本/CI                        |
| 库构建               | `pnpm run build`                    | 已纳入脚本/CI，生成 `dist/` 发布产物 |
| 打包预检             | `pnpm run pack:dry-run`             | 已纳入脚本/CI                        |
| 依赖审计             | `pnpm audit --audit-level moderate` | 已纳入脚本/CI                        |
| Taro H5 smoke        | `pnpm run test:taro:h5`             | 已覆盖                               |
| Taro weapp smoke     | `pnpm run test:taro:weapp`          | 已覆盖                               |
| Taro multi-end smoke | `pnpm run test:taro`                | 已纳入脚本/CI                        |

## 发布策略备注

`dist/` 不纳入 git 跟踪，只作为 npm 包发布产物存在。当前通过 `prepack` 在 `npm pack` / `npm publish` 前自动执行 `pnpm run build`，并由 `package.json` 的 `files` 与 `exports` 控制 tarball 内容。

0.3.x 的发布策略不需要改变这一点；更重要的是补齐“打包后消费侧验证”，确保 `npm pack` 产物中的 root、`./core`、`./vue`、`./style.css` 都能被外部项目按预期解析。

## 0.3.x 目标

### 目标 1：增加打包后消费侧类型与导出验证

**优先级：高**  
**建议版本：0.3.0**

**背景**

当前 CI 已覆盖源码类型检查、库构建和 `npm pack --dry-run`，但还没有从“外部使用者项目”的视角验证打包产物：

- root 入口是否能正确解析类型与运行时代码。
- `taro-routerless-tabbar/core` 是否完全无 CSS 副作用。
- `taro-routerless-tabbar/vue` 是否能解析 Vue composable、组件与类型。
- `taro-routerless-tabbar/style.css` 是否在 tarball 中可被显式导入。
- `exports`、`types`、`files` 与实际 `dist` 文件是否始终一致。

**规划**

新增一个轻量消费侧 fixture，例如 `examples/package-consumer` 或 `test/consumer`：

1. 通过 `pnpm pack` 生成本地 tarball，fixture 依赖这个 tarball，而不是 `file:../..` 源码目录。
2. 编写最小 TypeScript 文件分别导入：
   - `taro-routerless-tabbar`
   - `taro-routerless-tabbar/core`
   - `taro-routerless-tabbar/vue`
   - `taro-routerless-tabbar/style.css`
3. 使用 `tsc --noEmit` 或小型 Vite build 验证类型解析与 CSS 导入。
4. 增加脚本 `test:package-consumer`，并把它接入 CI 和 `prepublishOnly`。
5. 增加断言：`core.js` / `vue.js` 不包含 `style.css` import，root 入口仍保持兼容自动样式导入。

**验收标准**

- CI 能在全新安装场景下验证打包后子路径导出。
- `npm pack --dry-run` 清单和消费侧导入用例同时覆盖。
- 如果未来新增/删除导出，消费侧测试会失败并提示同步修改文档或 `package.json`。

### 目标 2：沉淀官方独立页 redirect helper

**优先级：高**  
**建议版本：0.3.0**

**背景**

当前文档已经说明独立 Tab 页面需要 redirect 回 main 容器，但实际接入仍需要业务复制样板逻辑。这个逻辑是 routerless tab 的关键边界：直接打开 `/pages/home/index` 时，页面应重定向到 `/pages/main/index?tab=home`，而 main 容器内嵌渲染时不能触发 redirect。

如果继续只靠文档示例，用户容易在以下细节上出错：

- `embedded` query / prop 的判断不统一。
- redirect query 与原始 query 合并策略不一致。
- 重定向时是否保留来源参数、分享参数不清晰。
- 每个 Tab 页面重复写相同逻辑，后续改约定成本高。

**规划**

新增纯 helper，暂定名 `createStandaloneTabRedirect` 或 `buildStandaloneTabRedirectUrl`，优先保持为 core 级能力，不直接依赖 Taro runtime：

```ts
const redirectUrl = buildStandaloneTabRedirectUrl({
  mainPagePath: '/pages/main/index',
  tabKey: 'home',
  currentQuery,
  embeddedQueryKey: 'embedded',
})
```

建议先提供 URL 构建能力，再评估是否在 `./vue` 中提供 `useStandaloneTabRedirect`：

- core helper：只负责判断是否需要 redirect、生成目标 URL、合并 query。
- Vue helper：可选封装 Taro `useLoad` / `redirectTo`，但需要谨慎评估测试复杂度和端侧差异。

**验收标准**

- 独立页 redirect 的 query 合并规则有单元测试覆盖。
- 文档中删除或弱化手写 redirect 样板，改为推荐官方 helper。
- fixture 至少有一个 Tab 页面使用官方 helper。
- 不破坏现有 `buildRouterlessTabUrl` 行为。

### 目标 3：补齐 retap 刷新状态的可观测能力

**优先级：中**  
**建议版本：0.3.x**

**背景**

当前 `createRetapRefreshCore` 已支持：注册 handler、并发保护、错误回调、动画 key 订阅。但业务在调试刷新链路时，仍需要自行判断：

- 当前 key 是否正在执行刷新 handler。
- 某个 key 是否已注册 handler。
- `runRefresh` 返回 `false` 是因为未注册，还是因为同 key 正在运行。

这些不影响运行时正确性，但会影响复杂业务里的问题定位。

**规划**

在保持现有 `runRefresh(key): Promise<boolean>` 兼容行为不变的前提下，评估新增更可观测的 API：

- `isRefreshRunning(key)`：判断某个 key 是否正在执行。
- `hasRefreshHandler(key)`：明确表达 handler 是否存在，避免使用者直接依赖 `getRefreshHandler`。
- `runRefreshDetailed(key)`：可选，返回 `{ started: boolean; reason?: 'missing-handler' | 'running' }`。

优先级建议：先加 `isRefreshRunning` / `hasRefreshHandler`，`runRefreshDetailed` 只有在真实业务需要区分原因时再加入。

**验收标准**

- 新 API 不改变现有 `runRefresh` 返回语义。
- core 与 Vue context 均导出相同可观测能力。
- retap 文档补充调试和空 handler 场景说明。

### 目标 4：增强 pane 宿主与默认样式的端侧安全性说明/能力

**优先级：中**  
**建议版本：0.3.x**

**背景**

`RouterlessTabPaneHost` 当前通过 `display: none` 隐藏非 active pane。这个策略简单且符合“保留实例”的目标，但在真实小程序页面中可能遇到差异：

- 隐藏 pane 内的滚动容器、视频、地图等端侧组件行为需要业务验证。
- 底栏固定定位与安全区、内容区 padding 的配合仍需要接入者处理。
- 默认 class 名和 CSS 变量虽然已文档化，但缺少更明确的布局建议和端侧检查清单。

**规划**

0.3.x 不急于改组件渲染策略，先补充可执行的接入检查清单；如业务反馈明确，再考虑新增轻量 prop：

- `hiddenClass`：允许业务覆盖非 active pane 的隐藏 class。
- `paneClass` / `hostClass`：降低完全自定义 pane host 的必要性。

**验收标准**

- `doc/styling.md` 和 `doc/compatibility.md` 增加端侧布局检查清单。
- 如果新增 prop，必须保持默认行为不变，并补组件单测。
- fixture 覆盖自定义隐藏 class 或保留文档说明不改代码。

### 目标 5：完善版本发布与 changelog 自动校验

**优先级：中**  
**建议版本：0.3.x**

**背景**

当前已有 release workflow 和 `CHANGELOG.md`，但发布前仍依赖人工确认版本号、tag、CHANGELOG、tarball 内容是否一致。0.3.x 可以把这些发布前约束脚本化，降低 npm 发布遗漏风险。

**规划**

新增发布预检脚本，例如 `release:check`：

1. 检查 `package.json` version 是否在 `CHANGELOG.md` 中有对应章节。
2. 检查 `CHANGELOG.md` 的 `Unreleased` 是否为空或符合预期。
3. 执行 `pnpm run prepublishOnly`。
4. 输出 `npm pack --dry-run` 清单，必要时对关键文件做断言。
5. 在 release workflow 中复用同一套脚本，避免本地/CI 两套逻辑漂移。

**验收标准**

- 发布前可用一个命令完成版本、CHANGELOG、质量门禁和 tarball 清单检查。
- release workflow 与本地脚本共享主要校验逻辑。
- 文档记录手动发布步骤和失败排查方式。

### 目标 6：持续扩展多端 smoke，但不阻塞 0.3.0

**优先级：低**  
**建议版本：0.3.x / 0.4.x**

**背景**

当前已覆盖 H5 和 WeChat 小程序 build smoke。考虑到本包目标是 Taro 小程序/H5，后续可以逐步增加更多端，但这类工作成本较高，且容易受 Taro 平台插件版本影响。

**规划**

- 优先保持 H5 + WeChat 小程序稳定。
- 视真实使用需求再增加支付宝、抖音等平台 smoke build。
- 如果新增端侧验证，先落在 fixture 和 CI 可重复构建，不承诺所有运行时交互完全一致。

**验收标准**

- 新增平台必须有独立脚本和文档矩阵记录。
- 不因非核心平台 smoke 不稳定阻塞 H5 / WeChat 的主链路发布。

## 版本计划

### 0.3.0：消费侧稳定性与接入样板

- [ ] 增加打包后消费侧 fixture，验证 root、`./core`、`./vue`、`./style.css` 导入。
- [ ] 将消费侧类型/导出验证接入 CI 和 `prepublishOnly`。
- [ ] 设计并实现独立页 redirect 的官方 core helper。
- [ ] 更新 `doc/integration-guide.md` / `doc/api.md`，用官方 helper 替代手写 redirect 样板。
- [ ] fixture 至少使用一次官方 redirect helper。

### 0.3.x：调试能力、样式边界与发布预检

- [ ] 为 retap core/context 增加 `hasRefreshHandler` / `isRefreshRunning` 等可观测 API。
- [ ] 补充 retap 调试文档，说明未注册、执行中、handler 抛错三类场景。
- [ ] 评估 `RouterlessTabPaneHost` 是否需要 `hiddenClass` / `paneClass` / `hostClass` 等轻量定制能力。
- [ ] 补充端侧布局检查清单：安全区、内容区 padding、滚动容器、重型原生组件。
- [ ] 新增发布预检脚本，校验版本号、CHANGELOG、质量门禁和 tarball 关键文件。

### 0.4.0：多端与运行时验证增强

- [ ] 视真实需求增加支付宝/抖音等小程序端 smoke build。
- [ ] 增加更接近真实业务的 fixture：长列表滚动、返回链路、分享参数、复杂 query。
- [ ] 梳理运行时端侧验证记录，区分 build smoke、手动真机验证和自动化验证。

### 1.0.0：稳定版条件

- [ ] API 命名和导出结构冻结。
- [ ] 打包后消费侧类型/导出验证稳定运行。
- [ ] 独立页 redirect、retap refresh、样式自定义均有官方推荐样板。
- [ ] H5 + 至少一个主流小程序端 smoke build 稳定。
- [ ] npm 发布流程可重复，tarball 内容有自动检查。
- [ ] CHANGELOG、兼容性说明、已知限制齐全。

## 推荐下一步

建议 0.3.0 先做两个最能降低发布风险的任务：

1. 新增打包后消费侧 fixture，并接入 CI / `prepublishOnly`。
2. 设计独立页 redirect 的 core helper，先把 URL 构建和 query 合并规则稳定下来。

这两个任务完成后，再根据真实业务反馈决定是否继续扩展 retap 可观测 API 和 pane host 定制能力。
