import type { KeyedTabItem } from '../types'

export const getTabKeys = <Key extends string, Item extends KeyedTabItem<Key>>(
  tabs: readonly Item[],
): Key[] => tabs.map((tab) => tab.key)

export const isTabKey = <Key extends string>(
  value: string,
  tabKeys: readonly Key[],
): value is Key => tabKeys.includes(value as Key)

export const normalizeTabKey = <Key extends string>(options: {
  value?: string
  tabKeys: readonly Key[]
  defaultKey: Key
  aliases?: Partial<Record<string, Key>>
}): Key => {
  const { aliases, defaultKey, tabKeys, value } = options

  if (value && aliases?.[value]) {
    return aliases[value] as Key
  }

  return value && isTabKey(value, tabKeys) ? value : defaultKey
}

export const createVisitedTabRecord = <Key extends string>(options: {
  tabKeys: readonly Key[]
  defaultKey: Key
}): Record<Key, boolean> => {
  const { defaultKey, tabKeys } = options

  return tabKeys.reduce(
    (result, key) => ({
      ...result,
      [key]: key === defaultKey,
    }),
    {} as Record<Key, boolean>,
  )
}

export const getVisitedTabs = <
  Key extends string,
  Item extends KeyedTabItem<Key>,
>(
  tabs: readonly Item[],
  visited: Partial<Record<Key, boolean>>,
) => tabs.filter((tab) => visited[tab.key] === true)
