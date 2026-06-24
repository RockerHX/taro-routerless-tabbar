# Taro Vue3 RouterlessTabs 极简示例

这是面向业务接入方的最小示例：只演示 `RouterlessTabs + tabs + defaultKey`，适合直接照着复制到项目里。

## 适用场景

- 想先快速判断 `RouterlessTabs` 是否符合项目预期。
- 希望用最少代码接入默认底栏、懒挂载和 pane 保活。
- 不需要 query 初始化、redirect、复杂 retap 刷新或详情返回链路。

## 启动命令

```bash
pnpm dev
pnpm dev:weapp
pnpm dev:alipay
```

也可以直接在示例目录运行：

```bash
pnpm --dir examples/taro-vue3-routerless-tabs-basic run dev:h5
pnpm --dir examples/taro-vue3-routerless-tabs-basic run dev:weapp
pnpm --dir examples/taro-vue3-routerless-tabs-basic run dev:alipay
```

## 构建命令

```bash
pnpm --dir examples/taro-vue3-routerless-tabs-basic run build:h5
pnpm --dir examples/taro-vue3-routerless-tabs-basic run build:weapp
pnpm --dir examples/taro-vue3-routerless-tabs-basic run build:alipay
```
