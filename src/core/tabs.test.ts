import { describe, expect, it } from 'vitest'

import { getTabKeys, isTabKey, normalizeTabKey } from './tabs'

const tabs = [
  { key: 'recommend', text: '推荐' },
  { key: 'orders', text: '订单' },
  { key: 'profile', text: '我的' },
] as const

describe('tab key helpers', () => {
  it('按原顺序返回 tab keys', () => {
    expect(getTabKeys(tabs)).toEqual(['recommend', 'orders', 'profile'])
  })

  it('识别合法和非法 tab key', () => {
    const tabKeys = getTabKeys(tabs)

    expect(isTabKey('recommend', tabKeys)).toBe(true)
    expect(isTabKey('orders', tabKeys)).toBe(true)
    expect(isTabKey('unknown', tabKeys)).toBe(false)
  })

  it('归一化合法 key、未知 key 和空值', () => {
    const tabKeys = getTabKeys(tabs)

    expect(
      normalizeTabKey({
        value: 'orders',
        tabKeys,
        defaultKey: 'recommend',
      }),
    ).toBe('orders')
    expect(
      normalizeTabKey({
        value: 'unknown',
        tabKeys,
        defaultKey: 'recommend',
      }),
    ).toBe('recommend')
    expect(
      normalizeTabKey({
        value: undefined,
        tabKeys,
        defaultKey: 'recommend',
      }),
    ).toBe('recommend')
  })

  it('alias 优先于直接 fallback', () => {
    const tabKeys = getTabKeys(tabs)

    expect(
      normalizeTabKey({
        value: 'index',
        tabKeys,
        defaultKey: 'recommend',
        aliases: { index: 'recommend' },
      }),
    ).toBe('recommend')
  })
})
