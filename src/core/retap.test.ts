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
