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
