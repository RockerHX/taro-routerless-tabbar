import { describe, expect, it, vi } from 'vitest'

import { createRetapRefreshCore } from './retap.js'

describe('createRetapRefreshCore registry and runner', () => {
  it('注册后可按 key 取到 handler，并可注销', () => {
    const core = createRetapRefreshCore<'recommend' | 'orders' | 'profile'>()
    const handler = vi.fn()

    core.registerRefreshHandler('recommend', handler)
    expect(core.getRefreshHandler('recommend')).toBe(handler)

    core.unregisterRefreshHandler('recommend', handler)
    expect(core.getRefreshHandler('recommend')).toBeUndefined()
  })

  it('未注册 key 上 runRefresh 返回 false', async () => {
    const core = createRetapRefreshCore<'recommend' | 'orders'>()

    await expect(core.runRefresh('orders')).resolves.toBe(false)
  })

  it('已注册 key 上 runRefresh 返回 true', async () => {
    const core = createRetapRefreshCore<'recommend' | 'orders'>()
    const handler = vi.fn().mockResolvedValue(undefined)

    core.registerRefreshHandler('recommend', handler)

    await expect(core.runRefresh('recommend')).resolves.toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('同一 key 执行中再次触发返回 false', async () => {
    const core = createRetapRefreshCore<'profile'>()
    let resolveRefresh: (() => void) | undefined
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve
        }),
    )

    core.registerRefreshHandler('profile', handler)

    const firstRun = core.runRefresh('profile')
    await Promise.resolve()

    await expect(core.runRefresh('profile')).resolves.toBe(false)
    expect(handler).toHaveBeenCalledTimes(1)

    resolveRefresh?.()
    await firstRun
  })

  it('handler 抛错后会释放当前 key 的执行态', async () => {
    const core = createRetapRefreshCore<'recommend'>()
    const handler = vi.fn().mockRejectedValue(new Error('boom'))

    core.registerRefreshHandler('recommend', handler)

    await expect(core.runRefresh('recommend')).resolves.toBe(true)
    await expect(core.runRefresh('recommend')).resolves.toBe(true)
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('onError 会在 handler 抛错时被调用一次', async () => {
    const onError = vi.fn()
    const core = createRetapRefreshCore<'orders'>({ onError })
    const error = new Error('boom')
    const handler = vi.fn().mockRejectedValue(error)

    core.registerRefreshHandler('orders', handler)

    await expect(core.runRefresh('orders')).resolves.toBe(true)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(error, 'orders')
  })
})

describe('createRetapRefreshCore animation state', () => {
  it('开始和结束动画时能同步当前 key', () => {
    const core = createRetapRefreshCore<'recommend' | 'orders' | 'profile'>()
    const states: Array<'recommend' | 'orders' | 'profile' | ''> = []
    const unsubscribe = core.subscribeRefreshAnimation((key) => {
      states.push(key)
    })

    expect(core.startRefreshAnimation('recommend')).toBe(true)
    expect(core.getAnimatingKey()).toBe('recommend')
    expect(core.startRefreshAnimation('recommend')).toBe(false)
    expect(core.stopRefreshAnimation('orders')).toBe(false)
    expect(core.stopRefreshAnimation('recommend')).toBe(true)
    expect(core.getAnimatingKey()).toBe('')

    unsubscribe()
    expect(states).toEqual(['recommend', ''])
  })

  it('不同 key 可以切换动画归属，旧 key 不会误停新动画', () => {
    const core = createRetapRefreshCore<'recommend' | 'orders'>()

    expect(core.startRefreshAnimation('recommend')).toBe(true)
    expect(core.startRefreshAnimation('orders')).toBe(true)
    expect(core.getAnimatingKey()).toBe('orders')
    expect(core.stopRefreshAnimation('recommend')).toBe(false)
    expect(core.getAnimatingKey()).toBe('orders')
    expect(core.stopRefreshAnimation('orders')).toBe(true)
    expect(core.getAnimatingKey()).toBe('')
  })

  it('unsubscribe 后不再收到状态更新', () => {
    const core = createRetapRefreshCore<'recommend'>()
    const listener = vi.fn()
    const unsubscribe = core.subscribeRefreshAnimation(listener)

    expect(core.startRefreshAnimation('recommend')).toBe(true)
    unsubscribe()
    expect(core.stopRefreshAnimation('recommend')).toBe(true)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith('recommend')
  })
})
