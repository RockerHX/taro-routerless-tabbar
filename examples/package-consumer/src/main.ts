import 'taro-routerless-tabbar/style.css'

import {
  RouterlessTabBar as RootRouterlessTabBar,
  RouterlessTabs as RootRouterlessTabs,
  buildRouterlessTabUrl as buildRootRouterlessTabUrl,
  resolveStandaloneTabRedirect as resolveRootStandaloneTabRedirect,
  type RouterlessTabsItem as RootRouterlessTabsItem,
} from 'taro-routerless-tabbar'
import {
  buildRouterlessTabUrl,
  createRetapRefreshCore,
  resolveStandaloneTabRedirect,
} from 'taro-routerless-tabbar/core'
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  RouterlessTabs as VueRouterlessTabs,
  createRetapRefreshContext,
  useRouterlessTabs,
  type RouterlessTabsItem as VueRouterlessTabsItem,
} from 'taro-routerless-tabbar/vue'
import { createApp, defineComponent, h } from 'vue'

const HomePane = defineComponent({
  name: 'HomePane',
  setup() {
    return () => h('text', 'home pane')
  },
})
const OrdersPane = defineComponent({
  name: 'OrdersPane',
  setup() {
    return () => h('text', 'orders pane')
  },
})
const tabItems = [
  { key: 'home', text: '首页' },
  { key: 'orders', text: '订单' },
] as const
const rootTabPanes = [
  { key: 'home', text: '首页', component: HomePane },
  { key: 'orders', text: '订单', component: OrdersPane },
] as const satisfies readonly RootRouterlessTabsItem[]
const vueTabPanes: readonly VueRouterlessTabsItem[] = rootTabPanes

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

const retapCoreStatus = `${retapCore.hasRefreshHandler('home')}:${retapCore.isRefreshRunning('home')}`
const retapContextStatus = `${retapContext.hasRefreshHandler('orders')}:${retapContext.isRefreshRunning('orders')}`

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
        h('text', `${retapCoreStatus}|${retapContextStatus}`),
        h(RootRouterlessTabBar, {
          active: tabs.activeKey.value,
          items: tabItems,
        }),
        h(RootRouterlessTabs, {
          tabs: rootTabPanes,
          defaultKey: 'home',
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
        h(VueRouterlessTabs, {
          tabs: vueTabPanes,
          defaultKey: 'orders',
        }),
      ])
  },
})

createApp(App).mount('#app')
