export type {
  KeyedTabItem,
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
