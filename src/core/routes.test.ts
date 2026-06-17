import { describe, expect, it } from 'vitest'

import { buildRouterlessTabUrl, resolveTabPageModuleKey } from './routes.js'

describe('routerless route helpers', () => {
  it('使用默认 tab query 生成主入口路径', () => {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index',
        tabKey: 'recommend',
      }),
    ).toBe('/pages/main/index?tab=recommend')
  })

  it('支持自定义 queryKey 和额外 query 参数', () => {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index',
        tabKey: 'orders',
        queryKey: 'activeTab',
        query: {
          embedded: true,
          from: 'share',
        },
      }),
    ).toBe('/pages/main/index?activeTab=orders&embedded=true&from=share')
  })

  it('忽略空 query 并覆盖同名 tab query', () => {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index',
        tabKey: 'profile',
        query: {
          tab: 'orders',
          foo: undefined,
          bar: null,
          source: 'push',
        },
      }),
    ).toBe('/pages/main/index?tab=profile&source=push')
  })

  it('把 pagePath 转成 main 页面可用模块 key', () => {
    expect(resolveTabPageModuleKey('/pages/orders/index')).toBe(
      '../orders/index.vue',
    )
    expect(resolveTabPageModuleKey('pages/profile/index')).toBe(
      '../profile/index.vue',
    )
  })

  it('非法 pagePath 抛错', () => {
    expect(() => resolveTabPageModuleKey('/subpkg/orders/index')).toThrow(
      'Invalid tab pagePath',
    )
  })
})
