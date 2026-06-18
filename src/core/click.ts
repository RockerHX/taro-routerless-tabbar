import type { TabClickResult } from '../types.js'

export function resolveTabClick<Key extends string>(
  activeKey: Key,
  clickedKey: Key,
): TabClickResult<Key> {
  if (clickedKey === activeKey) {
    return { type: 'retap', key: clickedKey }
  }

  return { type: 'change', key: clickedKey }
}
