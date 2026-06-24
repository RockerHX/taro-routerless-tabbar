# 项目现状分析与后续路线图

生成日期：2026-06-23  
当前版本：`0.2.1`

## 结论

当前项目没有发现阻塞发布的代码质量问题。本次本地验证通过了 lint、格式检查、类型检查、单元测试、构建、打包预检、依赖审计和 Taro H5 / WeChat 小程序 smoke build。

但项目仍有几个需要处理或跟踪的产品化/DX 问题：

1. `README.md` 已达到 561 行、约 17KB，内容混合了定位说明、完整接入、retap、样式、API 和实现限制，作为首页文档偏重，建议精简并拆分。
2. 已处理：retap 示例已统一为共享 context，避免使用者复制出不可工作的刷新链路。
3. 已处理：新增 `./core`、`./vue` 和 `./style.css` 子路径导出，helper-only 使用者可避开默认样式副作用。
4. 已处理：扩展 Taro fixture 覆盖 retap、query、图标和 CSS 变量，并新增 H5 / WeChat 小程序 smoke build。
5. 已处理：新增 `createTabPageModuleResolver`，并在文档中说明复杂项目可直接声明 `moduleKey`。

## 本次验证结果

| 检查项               | 命令                                | 结果                                           |
| -------------------- | ----------------------------------- | ---------------------------------------------- |
| ESLint               | `pnpm run lint`                     | 通过                                           |
| Prettier             | `pnpm run format:check`             | 通过                                           |
| TypeScript           | `pnpm run typecheck`                | 通过                                           |
| 单元测试             | `pnpm run test:run`                 | 9 个测试文件、63 个用例通过                    |
| 库构建               | `pnpm run build`                    | 通过，生成 `dist/index.js` 与 `dist/style.css` |
| 打包预检             | `pnpm run pack:dry-run`             | 通过，tarball 含 16 个文件                     |
| 依赖审计             | `pnpm audit --audit-level moderate` | 未发现已知漏洞                                 |
| Taro H5 smoke        | `pnpm run test:taro:h5`             | 通过                                           |
| Taro weapp smoke     | `pnpm run test:taro:weapp`          | 通过                                           |
| Taro multi-end smoke | `pnpm run test:taro`                | 通过                                           |

## 发布策略备注

`dist/` 不纳入 git 跟踪，只作为 npm 包发布产物存在。当前通过 `prepack` 在 `npm pack` / `npm publish` 前自动执行 `pnpm run build`，并由 `package.json` 的 `files: ["dist", ...]` 控制 tarball 内容。

这个策略与常规前端项目一致：源码进 git，构建产物不进 git。`dist/` 不再作为当前问题跟踪，只需在发布前通过 `npm pack --dry-run` 确认 tarball 清单即可。

## 发现的问题与解决方案

### 问题 1：README 过长，首页文档承担了太多职责

**优先级：高**

**现象**

- `README.md` 当前 561 行，包含完整业务配置、main 容器、多个 Tab 页面、retap 刷新、样式、API 表和页面模块解析说明。
- 新用户只想快速判断“能不能用、怎么最小接入”时，需要阅读过多细节。
- 高级内容和 API 约定混在 README 中，后续维护容易产生重复或过期示例。

**解决方案**

将 README 收敛到 120～180 行左右，只保留：

- 一句话定位和核心能力。
- 适用/不适用场景。
- 安装方式。
- 30～60 行最小示例：`useRouterlessTabs` + `RouterlessTabPaneHost` + `RouterlessTabBar`。
- 常用 API 速查链接。
- 兼容性、当前状态、文档导航。

新增或拆分以下文档：

- `doc/integration-guide.md`：完整接入，包括 `config/tabbar.ts`、main 容器、页面模块解析、独立页 redirect。
- `doc/retap-refresh.md`：共享 context、并发刷新、错误处理、动画状态。
- `doc/styling.md`：默认样式、slot 自定义、CSS 变量。
- `doc/api.md`：完整 API、类型、返回值和边界行为。

### 问题 2：retap 示例容易误导（已处理）

**优先级：高**

**处理状态：已完成（2026-06-24）**

**现象**

README 的 `pages/home/index.vue` 示例里直接 `createRetapRefreshContext<TabKey>()`，随后又用备注说明真实项目应共享 context。用户如果直接复制示例，main 容器和 Tab 页面会各自持有不同 context，`retap.runRefresh(tab)` 找不到页面注册的 handler。

**解决方案**

在文档中先给出共享单例文件，例如：

```ts
// pages/main/retap-refresh.ts
import { createRetapRefreshContext } from 'taro-routerless-tabbar'
import type { TabKey } from '@/config/tabbar'

export const tabRetap = createRetapRefreshContext<TabKey>()
export const useTabRetapRefresh = tabRetap.useRetapRefresh
export const useTabRetapRefreshAnimation = tabRetap.useRetapRefreshAnimation
```

然后 main 容器和所有 Tab 页面都只引用这个共享对象。README 里不要展示“新建第二个 context”的反例，反例可以放到 FAQ 或注意事项中。

当前 README 快速示例只保留核心 retap 事件入口，并明确指向 `doc/retap-refresh.md` 的共享单例接入方式；`doc/retap-refresh.md`、`doc/integration-guide.md` 和 `doc/api.md` 均已强调 main 容器与所有 Tab 页面必须复用同一个 context。

### 问题 3：root 入口自动带入 CSS，helper-only 使用场景不够干净（已处理）

**优先级：中**

**处理状态：已完成（2026-06-24）**

**现象**

构建后的 `index.js` 顶部会注入：

```js
import './style.css'
```

这对直接使用 `RouterlessTabBar` 很方便，但如果用户只使用 `buildRouterlessTabUrl`、`normalizeTabKey` 等纯 helper，也会引入默认样式副作用。

**解决方案**

增加子路径导出：

- `taro-routerless-tabbar/core`：只导出纯函数和类型，不引入 CSS。
- `taro-routerless-tabbar/vue`：导出 Vue composable/components，不自动引入 CSS。
- `taro-routerless-tabbar/style.css`：提供默认样式文件，供 `./vue` 入口用户显式导入。
- root 入口保持兼容，继续导出现有全部 API。

当前 root 入口仍自动引入默认样式；helper-only 使用者可改用 `./core`，组件用户可改用 `./vue` 并按需显式导入 `./style.css`。

### 问题 4：小程序端和复杂 Taro 项目覆盖不足（已处理）

**优先级：中**

**处理状态：已完成（2026-06-24）**

**现象**

此前已有最小 Taro Vue3 H5 fixture，能够证明 H5 构建链路可用；但项目 README 面向“小程序/H5 场景”，还需要更多实际端验证。

已补覆盖：

- WeChat 小程序构建 smoke。
- 包含 retap 刷新链路的 fixture 示例。
- subpackage 或非标准 pages 目录结构下的页面模块解析限制说明。
- 图标、刷新态、CSS 变量覆盖示例。

**解决方案**

已完成：

1. 扩展现有 `examples/taro-vue3-basic`，加入 retap、初始 query、样式覆盖和本地图标。
2. 新增 `test:taro:weapp` 与 `test:taro`，并将 H5 + weapp smoke 纳入 CI。
3. 新增 `doc/compatibility.md`，说明 H5 / WeChat 小程序 smoke 覆盖、routerless tab 与原生 `tabBar` 生命周期关系，以及复杂页面结构限制。

### 问题 5：`resolveTabPageModuleKey` 对目录结构假设较强（已处理）

**优先级：中**

**处理状态：已完成（2026-06-24）**

**现象**

当前 helper 只接受 `/pages/...` 形式，并转换为 `../xxx/index.vue`。这对基础项目足够，但对 subpackages、自定义 pages 根目录、main 页面不在同级目录等场景不够灵活。

**解决方案**

已完成：

1. 保留 `resolveTabPageModuleKey(pagePath)` 作为默认 resolver 的兼容快捷方法，继续支持 `/pages/...` 或 `pages/...` 转成 `../xxx/index.vue`。
2. 新增 `createTabPageModuleResolver`，支持通过 `pageRoot`、`modulePrefix` 和 `extension` 覆盖页面根目录、模块 key 前缀和文件扩展名。
3. 更新 README/API/完整接入/兼容性文档，说明 subpackage、自定义页面根目录、非同级 main 页面等场景可使用自定义 resolver。
4. 文档补充 `tabbarItems` 直接声明 `moduleKey` 的写法，适合页面路径和 `import.meta.glob` key 不存在稳定推导关系的项目。

```ts
createTabPageModuleResolver({
  pageRoot: '/subpackages/shop/pages',
  modulePrefix: '../../subpackages/shop/pages',
  extension: '.vue',
})
```

### 问题 6：组件事件类型还可以更精确

**优先级：低**

**现象**

当前 `RouterlessTabBar.vue` 的声明文件中，`change` / `retap` 事件参数仍是 `any[]`。运行时没有问题，但 TypeScript 使用体验可以更好。

**解决方案**

将 `defineEmits(['change', 'retap'])` 改为类型化 emits：

```ts
const emit = defineEmits<{
  change: [key: string]
  retap: [key: string]
}>()
```

受限于 Vue SFC 泛型，组件 props 的 key 很难自动保留业务字面量联合类型，但至少可以从 `any[]` 收敛到 `string`。

### 问题 7：内部小性能点

**优先级：低**

**现象**

`createVisitedTabRecord` 在 reduce 中每轮展开对象，复杂度偏高：

```ts
return {
  ...result,
  [key]: key === defaultKey,
}
```

Tab 数通常很少，因此不是问题。

**解决方案**

如果未来支持大量动态 Tab，可以改为原地赋值：

```ts
const result = {} as Record<Key, boolean>
tabKeys.forEach((key) => {
  result[key] = key === defaultKey
})
return result
```

## README 拆分建议

### 新 README 结构

```md
# taro-routerless-tabbar

一句话定位

## 核心能力

## 适用/不适用场景

## 安装

## 快速开始

## 文档

- 完整接入：doc/integration-guide.md
- retap 刷新：doc/retap-refresh.md
- 样式自定义：doc/styling.md
- API：doc/api.md

## 兼容性与当前状态

## License
```

### 从 README 移出的内容

| 当前内容                                      | 建议去向                                   |
| --------------------------------------------- | ------------------------------------------ |
| 和 Taro 原生 tabBar/custom-tab-bar 的详细对比 | README 简化版 + `doc/integration-guide.md` |
| `config/tabbar.ts` 完整代码                   | `doc/integration-guide.md`                 |
| `pages/main/index.vue` 完整代码               | `doc/integration-guide.md`                 |
| 多个 Tab 页面示例                             | `doc/integration-guide.md`                 |
| retap 刷新详细行为约定                        | `doc/retap-refresh.md`                     |
| 样式和 slot 自定义                            | `doc/styling.md`                           |
| API 速查表                                    | `doc/api.md`                               |
| 页面模块解析说明                              | `doc/integration-guide.md` 或 `doc/api.md` |

## 版本计划

### 0.2.x：发布前收敛与文档减负

- [ ] 精简 README，保留快速判断和最小接入。
- [ ] 新增 `doc/integration-guide.md`、`doc/retap-refresh.md`、`doc/styling.md`、`doc/api.md`。
- [x] 修正 retap 文档示例，统一使用共享 context。
- [ ] 将 `RouterlessTabBar` emits 类型从 `any[]` 收敛到 `string`。

### 0.3.0：DX 与导出结构优化

- [x] 增加 `./core` 子路径导出，纯 helper 不引入 CSS。
- [x] 评估 `./vue` 子路径导出，明确组件与样式导入策略。
- [x] 增强 `resolveTabPageModuleKey` 或新增可配置 resolver。
- [ ] 评估是否导出官方版 `useStandaloneTabRedirect`。
- [ ] 增加构建后声明文件/子路径导出的消费侧类型测试。

### 0.4.0：多端验证与示例增强

- [x] 扩展 Taro fixture，覆盖 retap、query 初始化、样式覆盖和 icon。
- [x] 增加 WeChat 小程序 smoke build。
- [x] 梳理 H5/小程序差异，形成兼容性矩阵。
- [x] 补充 subpackage 或复杂页面结构的示例/限制说明。

### 1.0.0：稳定版条件

- [ ] API 命名和导出结构冻结。
- [ ] README 与 doc 文档完成拆分且无重复过期示例。
- [x] H5 + 至少一个主流小程序端 smoke build 稳定。
- [ ] npm 发布流程可重复，构建产物与 tarball 内容有自动检查。
- [x] CHANGELOG、兼容性说明、已知限制齐全。

## 推荐下一步

优先做 0.2.x 的文档收敛，不建议马上改核心代码。当前代码和质量门禁是稳定的，最大问题是 README 信息密度过高，以及 retap 示例存在复制风险。

建议下一次任务按这个顺序执行：

1. 拆分 README 和 `doc/*` 文档。
2. 修正 retap 共享 context 示例。
3. 小改 `RouterlessTabBar` emits 类型。
4. 再考虑 0.3.0 的子路径导出和 resolver 设计。
