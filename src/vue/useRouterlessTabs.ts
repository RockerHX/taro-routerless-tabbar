import { computed, reactive, ref } from 'vue'
import type { Ref } from 'vue'

import { resolveTabClick } from '../core/click.js'
import {
  createVisitedTabRecord,
  getTabKeys,
  getVisitedTabs,
} from '../core/tabs.js'
import type {
  KeyedTabItem,
  TabClickResult,
  UseRouterlessTabsOptions,
  UseRouterlessTabsResult,
} from '../types.js'

export const useRouterlessTabs = <Item extends KeyedTabItem<string>>(
  options: UseRouterlessTabsOptions<Item['key'], Item>,
): UseRouterlessTabsResult<Item['key'], Item> => {
  const { defaultKey, initialKey, tabs } = options
  const tabKeys = getTabKeys(tabs)
  const activeKey = ref<Item['key']>(
    initialKey && tabKeys.includes(initialKey) ? initialKey : defaultKey,
  ) as Ref<Item['key']>
  const visitedRecord = reactive(
    createVisitedTabRecord({
      tabKeys,
      defaultKey,
    }),
  ) as Record<Item['key'], boolean>

  visitedRecord[activeKey.value] = true

  const activeTab = computed(
    () => tabs.find((tab) => tab.key === activeKey.value) ?? tabs[0],
  )

  const visitedTabs = computed(() => getVisitedTabs(tabs, visitedRecord))
  const visitedKeys = computed(() => visitedTabs.value.map((tab) => tab.key))

  const activateTab = (key: Item['key']) => {
    activeKey.value = key
    visitedRecord[key] = true
    return key
  }

  const isVisited = (key: Item['key']) => visitedRecord[key] === true
  const isActive = (key: Item['key']) => activeKey.value === key

  const handleTabClick = (key: Item['key']): TabClickResult<Item['key']> => {
    const result = resolveTabClick(activeKey.value, key)

    if (result.type === 'change') {
      activateTab(result.key)
    }

    return result
  }

  const resetVisited = () => {
    const nextVisitedRecord = createVisitedTabRecord({
      tabKeys,
      defaultKey,
    })

    nextVisitedRecord[activeKey.value] = true

    tabKeys.forEach((key) => {
      visitedRecord[key] = nextVisitedRecord[key]
    })
  }

  return {
    activeKey,
    activeTab,
    visitedKeys,
    visitedTabs,
    activateTab,
    handleTabClick,
    isVisited,
    isActive,
    resetVisited,
  }
}
