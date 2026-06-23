import type { KeyedTabItem } from '../types.js'

export function getTabKeys<const Item extends KeyedTabItem<string>>(
  tabs: readonly Item[],
): Array<Item['key']> {
  return tabs.map(function getTabKey(tab) {
    return tab.key
  })
}

export function isTabKey<Key extends string>(
  value: string,
  tabKeys: readonly Key[],
): value is Key {
  return tabKeys.includes(value as Key)
}

export function normalizeTabKey<Key extends string>(options: {
  value?: string
  tabKeys: readonly Key[]
  defaultKey: Key
  aliases?: Partial<Record<string, Key>>
}): Key {
  const { aliases, defaultKey, tabKeys, value } = options

  if (value && aliases?.[value]) {
    return aliases[value] as Key
  }

  return value && isTabKey(value, tabKeys) ? value : defaultKey
}

export function createVisitedTabRecord<Key extends string>(options: {
  tabKeys: readonly Key[]
  defaultKey: Key
}): Record<Key, boolean> {
  const { defaultKey, tabKeys } = options

  return tabKeys.reduce(
    function reduceVisitedRecord(result, key) {
      return {
        ...result,
        [key]: key === defaultKey,
      }
    },
    {} as Record<Key, boolean>,
  )
}

export function getVisitedTabs<
  Key extends string,
  Item extends KeyedTabItem<Key>,
>(tabs: readonly Item[], visited: Partial<Record<Key, boolean>>): Item[] {
  return tabs.filter(function isVisitedTab(tab) {
    return visited[tab.key] === true
  })
}
