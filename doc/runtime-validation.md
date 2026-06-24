# 端侧运行时验证矩阵

本文记录当前能力在不同验证层级下的覆盖状态，避免把 build smoke 误解为端侧运行时验证。

## 验证层级

| 层级                 | 命令或方式                         | 说明                                                          |
| -------------------- | ---------------------------------- | ------------------------------------------------------------- |
| 单元测试             | `pnpm run test:run`                | 覆盖 core helper、retap 和 Vue 状态。                         |
| 打包后消费侧验证     | `pnpm run test:package-consumer`   | 验证真实 tarball 导入、类型和构建。                           |
| H5 自动化运行时验证  | `pnpm run test:taro:h5:runtime`    | Playwright 覆盖真实浏览器交互链路。                           |
| 小程序 build smoke   | `pnpm run test:taro`               | 验证 H5 + WeChat 小程序可构建。                               |
| 小程序手动端侧验证   | 开发者工具 / 真机                  | 验证平台运行时样式、点击和页面栈；需与 build smoke 分开记录。 |
| 扩展平台 build smoke | `pnpm run test:taro:extended` 可选 | 当前覆盖支付宝构建，不阻断主链路。                            |

## 能力覆盖矩阵

| 能力                 | 单元测试 | 消费侧 | H5 runtime | WeChat build | Alipay build | 小程序手动 |
| -------------------- | -------- | ------ | ---------- | ------------ | ------------ | ---------- |
| `tab` query 初始化   | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| Tab 切换 active 状态 | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| 已访问 pane 保活     | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| retap 异步刷新       | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| redirect query 合并  | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| 返回链路             | 未覆盖   | 已构建 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| 长列表底部 padding   | 未覆盖   | 已构建 | 已覆盖     | 已构建       | 已构建       | 未完成     |
| 样式边界 class/变量  | 已覆盖   | 已覆盖 | 已覆盖     | 已构建       | 已构建       | 未完成     |

## 小程序手动检查清单

- Tab 切换：首次访问懒挂载，访问后切换不销毁 pane 状态。
- retap：点击当前 Tab 触发 loading、成功、失败提示，重复点击不并发刷新。
- redirect：独立 Tab 页面保留普通 query，过滤 `embedded`，覆盖旧 `tab`。
- 返回链路：从详情入口返回主容器后，active Tab 和 pane 本地状态保持。
- 布局：长列表最后一屏不被底栏遮挡，安全区 padding 生效。
- 重型原生组件：视频、地图、直播等在隐藏 pane 中恢复行为正常。

## 验证环境记录

| 日期       | Taro  | Vue | 平台插件                       | 环境             | 结果                                                                                          |
| ---------- | ----- | --- | ------------------------------ | ---------------- | --------------------------------------------------------------------------------------------- |
| 2026-06-24 | 4.2.0 | 3.x | h5/weapp/alipay 4.2.0          | Node 24 / macOS  | H5 runtime、H5/WeChat build、Alipay extended build 通过                                       |
| 2026-06-24 | 4.2.0 | 3.x | WeChat 开发者工具 1.06.2402040 | macOS / CLI open | 已确认工具版本；`pnpm run test:taro` 通过；本轮尝试打开构建产物超时，未完成开发者工具点击验证 |

## 已知限制

- WeChat 小程序当前自动化只覆盖 build smoke；2026-06-24 已识别本机 WeChat 开发者工具 1.06.2402040，但 CLI 打开构建产物超时，本轮未完成开发者工具或真机点击验证。
- 支付宝小程序已作为 experimental extended build smoke 覆盖，可用 `pnpm run test:taro:alipay` 或 `pnpm run test:taro:extended` 验证；它未进入 `test:taro` 主链路前不视为稳定支持范围。
- Alipay 构建中 fixture 会预先 emit `.browserslistrc`，用于规避 Taro 4.2.0 alipay 插件覆盖该 asset 时的 vite-runner 输出限制。
