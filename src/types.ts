export type KeyedTabItem<Key extends string = string> = {
  key: Key
}

export type TabClickResult<Key extends string> =
  | { type: 'change'; key: Key }
  | { type: 'retap'; key: Key }

export type RouterlessTabQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined

export type RetapRefreshHandler = () => void | Promise<void>

export type RetapAnimationListener<Key extends string> = (key: Key | '') => void

export type RetapRefreshContextOptions<Key extends string> = {
  onError?: (error: unknown, key: Key) => void
}
