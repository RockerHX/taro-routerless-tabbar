import { computed, reactive, ref } from 'vue'

import { resolveTabClick } from '../core/click.js'
import {
  createVisitedTabRecord,
  getTabKeys,
  getVisitedTabs,
} from '../core/tabs.js'
import type { KeyedTabItem, TabClickResult } from '../types.js'

type UseRouterlessTabsOptions<
  Key extends string,
  Item extends KeyedTabItem<Key>,
> = {
  tabs: readonly Item[]
  defaultKey: Key
  initialKey?: Key
}

export const useRouterlessTabs = <
  Key extends string,
  Item extends KeyedTabItem<Key>,
>(
  options: UseRouterlessTabsOptions<Key, Item>,
) => {
  const { defaultKey, initialKey, tabs } = options
  const tabKeys = getTabKeys(tabs)
  const activeKey = ref<Key>(
    initialKey && tabKeys.includes(initialKey) ? initialKey : defaultKey,
  )
  const visitedRecord = reactive(
    createVisitedTabRecord({
      tabKeys,
      defaultKey,
    }),
  ) as Record<Key, boolean>

  visitedRecord[activeKey.value] = true

  const activeTab = computed(
    () => tabs.find((tab) => tab.key === activeKey.value) ?? tabs[0],
  )

  const visitedTabs = computed(() => getVisitedTabs(tabs, visitedRecord))
  const visitedKeys = computed(() => visitedTabs.value.map((tab) => tab.key))

  const activateTab = (key: Key) => {
    activeKey.value = key
    visitedRecord[key] = true
    return key
  }

  const isVisited = (key: Key) => visitedRecord[key] === true
  const isActive = (key: Key) => activeKey.value === key

  const handleTabClick = (key: Key): TabClickResult<Key> => {
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
