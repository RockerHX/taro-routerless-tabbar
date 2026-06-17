export type {
  KeyedTabItem,
  RetapAnimationListener,
  RetapRefreshContextOptions,
  RetapRefreshHandler,
  RouterlessTabBarItem,
  RouterlessTabQueryValue,
  TabClickResult,
} from './types.js'

export { resolveTabClick } from './core/click.js'
export {
  createVisitedTabRecord,
  getTabKeys,
  getVisitedTabs,
  isTabKey,
  normalizeTabKey,
} from './core/tabs.js'
export {
  buildRouterlessTabUrl,
  resolveTabPageModuleKey,
} from './core/routes.js'
export { createRetapRefreshCore } from './core/retap.js'
export { createRetapRefreshContext } from './vue/useRetapRefresh.js'
export { default as RouterlessTabBar } from './vue/RouterlessTabBar.vue'
