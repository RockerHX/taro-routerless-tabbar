import { describe, expect, it } from 'vitest'
import {
  buildRouterlessTabUrl,
  createTabPageModuleResolver,
  resolveStandaloneTabRedirect,
  resolveTabPageModuleKey,
} from './routes.js'
describe('routerless route helpers', function () {
  it('使用默认 tab query 生成主入口路径', function () {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index',
        tabKey: 'recommend',
      }),
    ).toBe('/pages/main/index?tab=recommend')
  })
  it('支持自定义 queryKey 和额外 query 参数', function () {
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
  it('忽略空 query 并覆盖同名 tab query', function () {
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
  it('保留 mainPagePath 上已有 query 参数', function () {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index?from=share',
        tabKey: 'orders',
      }),
    ).toBe('/pages/main/index?tab=orders&from=share')
  })
  it('tabKey 覆盖 mainPagePath 上已有同名 tab query', function () {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index?tab=recommend&from=share',
        tabKey: 'orders',
      }),
    ).toBe('/pages/main/index?tab=orders&from=share')
  })
  it('额外 query 覆盖 mainPagePath 上已有同名非 tab query', function () {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index?from=share&source=old',
        tabKey: 'orders',
        query: {
          from: 'push',
          embedded: true,
        },
      }),
    ).toBe('/pages/main/index?tab=orders&source=old&from=push&embedded=true')
  })
  it('保留 mainPagePath 上的 hash', function () {
    expect(
      buildRouterlessTabUrl({
        mainPagePath: '/pages/main/index?from=share#profile',
        tabKey: 'profile',
        query: {
          from: 'push',
        },
      }),
    ).toBe('/pages/main/index?tab=profile&from=push#profile')
  })
  it('embedded=true 时不生成独立页重定向 URL', function () {
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index',
        tabKey: 'home',
        embedded: true,
      }),
    ).toEqual({
      shouldRedirect: false,
      url: '',
    })
  })
  it('query 中 embedded=true 或 embedded=1 时不生成独立页重定向 URL', function () {
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index',
        tabKey: 'home',
        currentQuery: {
          embedded: 'true',
        },
      }),
    ).toEqual({
      shouldRedirect: false,
      url: '',
    })
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index',
        tabKey: 'orders',
        currentQuery: {
          embedded: '1',
        },
      }),
    ).toEqual({
      shouldRedirect: false,
      url: '',
    })
  })
  it('独立打开时生成 main 容器重定向 URL', function () {
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index',
        tabKey: 'profile',
      }),
    ).toEqual({
      shouldRedirect: true,
      url: '/pages/main/index?tab=profile',
    })
  })
  it('生成重定向 URL 时保留普通 query、过滤 embedded 并覆盖旧 tab', function () {
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index?from=main&tab=home',
        tabKey: 'orders',
        currentQuery: {
          embedded: false,
          from: 'share',
          tab: 'profile',
          source: 'push',
          empty: undefined,
        },
      }),
    ).toEqual({
      shouldRedirect: true,
      url: '/pages/main/index?tab=orders&from=share&source=push',
    })
  })
  it('生成重定向 URL 时支持自定义 queryKey 和 embeddedQueryKey', function () {
    expect(
      resolveStandaloneTabRedirect({
        mainPagePath: '/pages/main/index?active=home&from=main',
        tabKey: 'profile',
        queryKey: 'active',
        embeddedQueryKey: 'inTab',
        currentQuery: {
          active: 'orders',
          from: 'share',
          inTab: false,
        },
      }),
    ).toEqual({
      shouldRedirect: true,
      url: '/pages/main/index?active=profile&from=share',
    })
  })
  it('把 pagePath 转成 main 页面可用模块 key', function () {
    expect(resolveTabPageModuleKey('/pages/orders/index')).toBe(
      '../orders/index.vue',
    )
    expect(resolveTabPageModuleKey('pages/profile/index')).toBe(
      '../profile/index.vue',
    )
  })
  it('非法 pagePath 抛错', function () {
    expect(function () {
      return resolveTabPageModuleKey('/subpkg/orders/index')
    }).toThrow('Invalid tab pagePath')
  })
  it('支持自定义页面模块 resolver', function () {
    const resolveSubpackageModuleKey = createTabPageModuleResolver({
      pageRoot: '/subpackages/shop/pages',
      modulePrefix: '../../subpackages/shop/pages',
      extension: '.vue',
    })

    expect(
      resolveSubpackageModuleKey('/subpackages/shop/pages/orders/index'),
    ).toBe('../../subpackages/shop/pages/orders/index.vue')
    expect(
      resolveSubpackageModuleKey('subpackages/shop/pages/cart/index'),
    ).toBe('../../subpackages/shop/pages/cart/index.vue')
  })
  it('支持自定义模块前缀和扩展名', function () {
    const resolveTsxModuleKey = createTabPageModuleResolver({
      pageRoot: 'custom-pages',
      modulePrefix: './custom-pages/',
      extension: '.tsx',
    })

    expect(resolveTsxModuleKey('/custom-pages/home/index')).toBe(
      './custom-pages/home/index.tsx',
    )
  })
  it('自定义 resolver 对非法 pagePath 保持相同错误语义', function () {
    const resolveCustomModuleKey = createTabPageModuleResolver({
      pageRoot: '/custom-pages',
      modulePrefix: './custom-pages',
    })

    expect(function () {
      return resolveCustomModuleKey('/pages/home/index')
    }).toThrow('Invalid tab pagePath')
  })
})
