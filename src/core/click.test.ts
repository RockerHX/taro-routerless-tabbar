import { describe, expect, it } from 'vitest'

import { resolveTabClick } from './click.js'

describe('resolveTabClick', () => {
  it('点击非当前 tab 返回 change', () => {
    expect(resolveTabClick('recommend', 'orders')).toEqual({
      type: 'change',
      key: 'orders',
    })
  })

  it('点击当前 tab 返回 retap', () => {
    expect(resolveTabClick('recommend', 'recommend')).toEqual({
      type: 'retap',
      key: 'recommend',
    })
  })

  it('保持字面量 key 类型', () => {
    const result = resolveTabClick('recommend', 'orders')
    const expected:
      | { type: 'change'; key: 'recommend' | 'orders' }
      | { type: 'retap'; key: 'recommend' | 'orders' } = result

    expect(expected).toEqual({
      type: 'change',
      key: 'orders',
    })
  })
})
