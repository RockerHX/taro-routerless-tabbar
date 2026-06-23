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

export function useRouterlessTabs<Item extends KeyedTabItem<string>>(
  options: UseRouterlessTabsOptions<Item['key'], Item>,
): UseRouterlessTabsResult<Item['key'], Item> {
  const { defaultKey, initialKey, tabs } = options
  const tabKeys = getTabKeys(tabs)

  if (tabKeys.length === 0) {
    throw new Error('Routerless tabs cannot be empty')
  }

  if (!tabKeys.includes(defaultKey)) {
    throw new Error(`Invalid default routerless tab key: ${defaultKey}`)
  }

  function assertTabKey(key: Item['key']) {
    if (!tabKeys.includes(key)) {
      throw new Error(`Invalid routerless tab key: ${key}`)
    }
  }

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

  const activeTab = computed(function getActiveTab() {
    return (
      tabs.find(function isActiveTab(tab) {
        return tab.key === activeKey.value
      }) ?? tabs[0]
    )
  })

  const visitedTabs = computed(function getComputedVisitedTabs() {
    return getVisitedTabs(tabs, visitedRecord)
  })
  const visitedKeys = computed(function getVisitedKeys() {
    return visitedTabs.value.map(function getVisitedKey(tab) {
      return tab.key
    })
  })

  function activateTab(key: Item['key']) {
    assertTabKey(key)
    activeKey.value = key
    visitedRecord[key] = true
    return key
  }

  function isVisited(key: Item['key']) {
    return visitedRecord[key] === true
  }

  function isActive(key: Item['key']) {
    return activeKey.value === key
  }

  function handleTabClick(key: Item['key']): TabClickResult<Item['key']> {
    assertTabKey(key)
    const result = resolveTabClick(activeKey.value, key)

    if (result.type === 'change') {
      activateTab(result.key)
    }

    return result
  }

  function resetVisited() {
    const nextVisitedRecord = createVisitedTabRecord({
      tabKeys,
      defaultKey,
    })

    nextVisitedRecord[activeKey.value] = true

    tabKeys.forEach(function resetVisitedKey(key) {
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
