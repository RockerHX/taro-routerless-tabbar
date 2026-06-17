// @vitest-environment happy-dom

import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { mountSetup } from './test-utils.js'
import { createRetapRefreshContext } from './useRetapRefresh.js'

describe('createRetapRefreshContext', () => {
  it('enabled=true 挂载后注册，卸载后注销', async () => {
    const context = createRetapRefreshContext<'recommend'>()
    const handler = vi.fn()
    const mounted = mountSetup(() => {
      context.useRetapRefresh('recommend', handler)
      return null
    })

    expect(context.getRefreshHandler('recommend')).toBe(handler)

    mounted.unmount()
    await nextTick()

    expect(context.getRefreshHandler('recommend')).toBeUndefined()
  })

  it('enabled 从 false 到 true 再到 false 时同步注册状态', async () => {
    const context = createRetapRefreshContext<'orders'>()
    const handler = vi.fn()
    const enabled = ref(false)

    const mounted = mountSetup(() => {
      context.useRetapRefresh('orders', handler, enabled)
      return { enabled }
    })

    expect(context.getRefreshHandler('orders')).toBeUndefined()

    enabled.value = true
    await nextTick()
    expect(context.getRefreshHandler('orders')).toBe(handler)

    enabled.value = false
    await nextTick()
    expect(context.getRefreshHandler('orders')).toBeUndefined()

    mounted.unmount()
  })

  it('卸载后停止 watch，后续改 enabled 不再影响 context', async () => {
    const context = createRetapRefreshContext<'profile'>()
    const handler = vi.fn()
    const enabled = ref(true)

    const mounted = mountSetup(() => {
      context.useRetapRefresh('profile', handler, enabled)
      return { enabled }
    })

    expect(context.getRefreshHandler('profile')).toBe(handler)

    mounted.unmount()
    await nextTick()
    expect(context.getRefreshHandler('profile')).toBeUndefined()

    enabled.value = true
    await nextTick()
    expect(context.getRefreshHandler('profile')).toBeUndefined()
  })

  it('useRetapRefreshAnimation 卸载后会清掉当前动画 key', async () => {
    const context = createRetapRefreshContext<'recommend'>()
    const mounted = mountSetup(() => {
      const animation = context.useRetapRefreshAnimation('recommend')
      return { animation }
    })

    expect(mounted.exposed.animation.startRefreshAnimation()).toBe(true)
    expect(context.getAnimatingKey()).toBe('recommend')

    mounted.unmount()
    await nextTick()

    expect(context.getAnimatingKey()).toBe('')
  })

  it('暴露的 core 方法仍可直接工作', async () => {
    const context = createRetapRefreshContext<'orders'>()
    const handler = vi.fn().mockResolvedValue(undefined)

    context.registerRefreshHandler('orders', handler)

    await expect(context.runRefresh('orders')).resolves.toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
