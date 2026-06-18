// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mountSetup } from './test-utils.js'
import { useRouterlessTabs } from './useRouterlessTabs.js'
const tabs = [
  { key: 'recommend', text: '推荐' },
  { key: 'orders', text: '订单' },
  { key: 'profile', text: '我的' },
] as const
describe('useRouterlessTabs', function () {
  it('默认激活 defaultKey，且仅默认 tab 已访问', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    expect(mounted.exposed.activeKey.value).toBe('recommend')
    expect(mounted.exposed.activeTab.value).toEqual(tabs[0])
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend'])
    expect(mounted.exposed.visitedTabs.value).toEqual([tabs[0]])
    mounted.unmount()
  })
  it('initialKey 合法时激活并标记访问，同时保留默认 tab 已访问', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
        initialKey: 'orders',
      })
    })
    expect(mounted.exposed.activeKey.value).toBe('orders')
    expect(mounted.exposed.activeTab.value).toEqual(tabs[1])
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend', 'orders'])
    mounted.unmount()
  })
  it('非法 initialKey 回退到 defaultKey', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
        initialKey: 'unknown' as 'recommend',
      })
    })
    expect(mounted.exposed.activeKey.value).toBe('recommend')
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend'])
    mounted.unmount()
  })
  it('activateTab 会切换 active 并标记 visited', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    mounted.exposed.activateTab('orders')
    expect(mounted.exposed.activeKey.value).toBe('orders')
    expect(mounted.exposed.isActive('orders')).toBe(true)
    expect(mounted.exposed.isVisited('orders')).toBe(true)
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend', 'orders'])
    mounted.unmount()
  })
  it('handleTabClick 点击非当前 tab 返回 change 并完成切换', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    expect(mounted.exposed.handleTabClick('orders')).toEqual({
      type: 'change',
      key: 'orders',
    })
    expect(mounted.exposed.activeKey.value).toBe('orders')
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend', 'orders'])
    mounted.unmount()
  })
  it('handleTabClick 点击当前 tab 返回 retap，且不改变 active', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    expect(mounted.exposed.handleTabClick('recommend')).toEqual({
      type: 'retap',
      key: 'recommend',
    })
    expect(mounted.exposed.activeKey.value).toBe('recommend')
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend'])
    mounted.unmount()
  })
  it('visitedTabs 顺序与原 tabs 顺序一致', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    mounted.exposed.activateTab('profile')
    mounted.exposed.activateTab('orders')
    expect(mounted.exposed.visitedTabs.value).toEqual([
      tabs[0],
      tabs[1],
      tabs[2],
    ])
    expect(mounted.exposed.visitedKeys.value).toEqual([
      'recommend',
      'orders',
      'profile',
    ])
    mounted.unmount()
  })
  it('resetVisited 重置为默认 tab 和当前 active tab 已访问', function () {
    const mounted = mountSetup(function () {
      return useRouterlessTabs({
        tabs,
        defaultKey: 'recommend',
      })
    })
    mounted.exposed.activateTab('orders')
    mounted.exposed.activateTab('profile')
    expect(mounted.exposed.visitedKeys.value).toEqual([
      'recommend',
      'orders',
      'profile',
    ])
    mounted.exposed.resetVisited()
    expect(mounted.exposed.activeKey.value).toBe('profile')
    expect(mounted.exposed.visitedKeys.value).toEqual(['recommend', 'profile'])
    expect(mounted.exposed.isVisited('orders')).toBe(false)
    mounted.unmount()
  })
})
