# 当前项目分析报告

生成日期：2026-06-23  
最近复核：2026-06-23

## 1. 项目概览

`taro-routerless-tabbar` 是一个面向 Taro 4 + Vue 3 的 routerless 自定义 TabBar 库。核心目标是把多个 Tab 页面收口到同一个主容器内切换，避免普通 Tab 路由切换时的重建、闪烁和状态丢失。

当前主要模块：

- `src/core/`：纯函数能力，包括点击判定、Tab key 处理、URL/模块 key 处理、retap refresh 核心。
- `src/vue/`：Vue 组件和 composable，包括 `RouterlessTabBar`、`RouterlessTabPaneHost`、`useRouterlessTabs`、`createRetapRefreshContext`。
- `examples/taro-vue3-basic/`：最小 Taro Vue3 H5 集成验证 fixture。
- `.github/workflows/ci.yml`：自动化质量门禁。
- `scripts/`：构建前清理和构建后自动注入 `style.css` import。

## 2. 当前验证结果

当前已在工作区执行以下检查：

| 检查项                              | 结果                                     |
| ----------------------------------- | ---------------------------------------- |
| `pnpm run lint`                     | 通过                                     |
| `pnpm run format:check`             | 通过                                     |
| `pnpm run typecheck`                | 通过                                     |
| `pnpm run test:run`                 | 通过，9 个测试文件、63 个测试全部通过    |
| `pnpm run build`                    | 通过                                     |
| `pnpm run pack:dry-run`             | 通过，dry-run tarball 共 16 个文件       |
| `pnpm audit --audit-level moderate` | 通过，未发现已知漏洞                     |
| `pnpm outdated --format table`      | 通过，无可升级直接依赖输出               |
| `pnpm run test:taro:h5`             | 通过，最小 Taro Vue3 H5 fixture 构建成功 |

结论：当前 lint、格式、类型、单测、构建、打包、安全审计、依赖过期检查和 Taro H5 smoke build 均已覆盖，原报告列出的主要问题已完成处理。

## 3. 原问题处理状态

| 原问题                                               | 状态 | 处理结果                                                                                                 |
| ---------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| P0：依赖安全审计存在严重告警                         | 完成 | 升级测试/构建链路并移除不必要 Taro 直接 devDependencies；当前 `pnpm audit --audit-level moderate` 通过。 |
| P1：依赖栈整体偏旧，后续维护成本会上升               | 完成 | 升级 Vite、Vitest、ESLint、TypeScript、Vue 测试/类型链路等剩余开发依赖；当前 `pnpm outdated` 无输出。    |
| P1：Dart Sass legacy JS API deprecation warning      | 完成 | Taro smoke fixture 改用 CSS，移除 fixture 内不必要 Sass 依赖；`test:taro:h5` 不再触发该警告。            |
| P1：发布产物中混入测试辅助类型文件                   | 完成 | `tsconfig.build.json` 排除测试辅助文件；dry-run tarball 不再包含 `dist/vue/test-utils.d.ts`。            |
| P1：`useRouterlessTabs` 缺少运行时边界保护           | 完成 | 增加空 tabs、非法 defaultKey、非法 activate/handleTabClick key 校验，并补充单测。                        |
| P2：`buildRouterlessTabUrl` 对已有 query/hash 不安全 | 完成 | 支持已有 query/hash；明确覆盖规则并补充测试。                                                            |
| P2：retap refresh 错误语义和注册语义不明确           | 完成 | README/API 文档明确 `runRefresh` 返回值、错误处理和重复注册覆盖语义，并补充覆盖测试。                    |
| P2：缺少真实 Taro 应用级集成验证                     | 完成 | 新增 `examples/taro-vue3-basic/` 和 `test:taro:h5`，CI 中纳入 smoke build。                              |
| P3：TypeScript 严格度还有提升空间                    | 完成 | 开启 `noImplicitAny: true`，保留 `skipLibCheck: true` 避免 Taro 生态类型噪声扩大。                       |
| 缺少 CI 自动验证                                     | 完成 | 新增 GitHub Actions CI，覆盖 lint、format、typecheck、test、build、pack、audit 和 Taro H5 smoke。        |

## 4. 当前剩余观察项

- `pnpm update` 会提示 `glob@10.5.0` deprecated。该依赖来自 `@vue/test-utils@2.4.11 -> js-beautify@1.15.4 -> glob@10.5.0`，两个上游包当前均已是最新版，且 `pnpm audit --audit-level moderate` 通过。暂不建议用 overrides 强行跨大版本覆盖，避免引入上游兼容风险。
- `skipLibCheck: true` 暂时保留。这是 Taro 生态下较稳妥的选择，可在后续 Taro/Vue 类型生态更稳定后单独评估。
- 本仓库尚未执行 `npm publish`。发布动作需要维护者确认 npm 账号、token、发布范围和 release note 后再执行。

## 5. 发布前建议

准备发布 `0.2.0` 前，建议保持以下最终门禁全部通过：

```bash
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run pack:dry-run
pnpm audit --audit-level moderate
pnpm run test:taro:h5
```

当前以上门禁已通过。除实际 `npm publish` 外，原分析报告中的待处理事项已完成。
