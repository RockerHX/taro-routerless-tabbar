import type { TabClickResult } from '../types.js'

export const resolveTabClick = <Key extends string>(
  activeKey: Key,
  clickedKey: Key,
): TabClickResult<Key> => {
  if (clickedKey === activeKey) {
    return { type: 'retap', key: clickedKey }
  }

  return { type: 'change', key: clickedKey }
}
