export type KeyedTabItem<Key extends string = string> = {
  key: Key
}

export type TabClickResult<Key extends string> =
  | { type: 'change'; key: Key }
  | { type: 'retap'; key: Key }
