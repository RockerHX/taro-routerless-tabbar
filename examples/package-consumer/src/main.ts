import 'taro-routerless-tabbar/style.css'

import {
  RouterlessTabBar as RootRouterlessTabBar,
  buildRouterlessTabUrl as buildRootRouterlessTabUrl,
  resolveStandaloneTabRedirect as resolveRootStandaloneTabRedirect,
} from 'taro-routerless-tabbar'
import {
  buildRouterlessTabUrl,
  createRetapRefreshCore,
  resolveStandaloneTabRedirect,
} from 'taro-routerless-tabbar/core'
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  createRetapRefreshContext,
  useRouterlessTabs,
} from 'taro-routerless-tabbar/vue'
import { createApp, defineComponent, h } from 'vue'

const tabItems = [
  { key: 'home', text: '首页' },
  { key: 'orders', text: '订单' },
] as const

const rootUrl = buildRootRouterlessTabUrl({
  mainPagePath: '/pages/main/index',
  tabKey: 'home',
})
const coreUrl = buildRouterlessTabUrl({
  mainPagePath: '/pages/main/index?from=consumer',
  tabKey: 'orders',
})
const rootRedirect = resolveRootStandaloneTabRedirect({
  mainPagePath: '/pages/main/index',
  tabKey: 'home',
  currentQuery: {
    from: 'root',
  },
})
const coreRedirect = resolveStandaloneTabRedirect({
  mainPagePath: '/pages/main/index',
  tabKey: 'orders',
  currentQuery: {
    embedded: 'false',
    from: 'core',
  },
})
const retapCore = createRetapRefreshCore<(typeof tabItems)[number]['key']>()
const retapContext =
  createRetapRefreshContext<(typeof tabItems)[number]['key']>()

retapCore.registerRefreshHandler('home', () => undefined)
retapContext.registerRefreshHandler('orders', () => undefined)

const App = defineComponent({
  name: 'PackageConsumerApp',
  setup() {
    const tabs = useRouterlessTabs({
      tabs: tabItems,
      defaultKey: 'home',
    })

    return () =>
      h('view', [
        h('text', `${rootUrl}|${coreUrl}`),
        h('text', `${rootRedirect.url}|${coreRedirect.url}`),
        h(RootRouterlessTabBar, {
          active: tabs.activeKey.value,
          items: tabItems,
        }),
        h(RouterlessTabPaneHost, {
          items: tabItems,
          active: tabs.activeKey.value,
          visited: tabs.visitedKeys.value,
        }),
        h(RouterlessTabBar, {
          active: tabs.activeKey.value,
          items: tabItems,
        }),
      ])
  },
})

createApp(App).mount('#app')
