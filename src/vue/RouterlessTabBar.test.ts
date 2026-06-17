// @vitest-environment happy-dom

import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RouterlessTabBar from './RouterlessTabBar.vue'

const items = [
  {
    key: 'recommend',
    text: '推荐',
    iconPath: '/icons/recommend.png',
    selectedIconPath: '/icons/recommend-active.png',
  },
  {
    key: 'orders',
    text: '订单',
    iconPath: '/icons/orders.png',
    selectedIconPath: '/icons/orders-active.png',
  },
] as const

describe('RouterlessTabBar', () => {
  it('渲染 items 文案', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
    })

    expect(wrapper.text()).toContain('推荐')
    expect(wrapper.text()).toContain('订单')
  })

  it('点击非当前 tab emits change', async () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toEqual([['orders']])
    expect(wrapper.emitted('retap')).toBeUndefined()
  })

  it('点击当前 tab emits retap', async () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[0]?.trigger('click')

    expect(wrapper.emitted('retap')).toEqual([['recommend']])
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('active item 使用 selectedIconPath', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
    })

    const images = wrapper.findAll('image')
    expect(images[0]?.attributes('src')).toBe('/icons/recommend-active.png')
    expect(images[1]?.attributes('src')).toBe('/icons/orders.png')
  })

  it('缺失 selectedIconPath 时回退到 iconPath', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items: [
          {
            key: 'recommend',
            text: '推荐',
            iconPath: '/icons/recommend.png',
          },
        ],
      },
    })

    expect(wrapper.find('image').attributes('src')).toBe('/icons/recommend.png')
  })

  it('缺失 icon 时不渲染 image，但 text 仍显示', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'profile',
        items: [
          {
            key: 'profile',
            text: '我的',
          },
        ],
      },
    })

    expect(wrapper.find('image').exists()).toBe(false)
    expect(wrapper.text()).toContain('我的')
  })

  it('refreshing item 带 refreshing class 和 active class', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
        refreshing: 'recommend',
      },
    })

    const firstItem = wrapper.findAll('.routerless-tabbar-item')[0]

    expect(firstItem?.classes()).toContain('routerless-tabbar-item-active')
    expect(firstItem?.classes()).toContain('routerless-tabbar-item-refreshing')
  })

  it('refreshIcon 存在时显示 refresh icon 并隐藏默认 text/icon', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
        refreshing: 'recommend',
        refreshIcon: '/icons/refresh.svg',
      },
    })
    const firstItem = wrapper.findAll('.routerless-tabbar-item')[0]

    expect(firstItem?.find('.routerless-tabbar-refresh-icon').exists()).toBe(
      true,
    )
    expect(
      firstItem?.find('.routerless-tabbar-refresh-icon').attributes('src'),
    ).toBe('/icons/refresh.svg')
    expect(firstItem?.find('.routerless-tabbar-icon').exists()).toBe(false)
    expect(firstItem?.find('.routerless-tabbar-text').exists()).toBe(false)
  })

  it('refreshIcon 缺失时回退普通内容', () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
        refreshing: 'recommend',
      },
    })

    expect(wrapper.find('.routerless-tabbar-refresh-icon').exists()).toBe(false)
    expect(wrapper.find('.routerless-tabbar-icon').exists()).toBe(true)
    expect(wrapper.find('.routerless-tabbar-text').exists()).toBe(true)
  })

  it('item 插槽能拿到完整 slot props，并替换默认内容', () => {
    const received: Array<{
      active: boolean
      iconPath: string
      item: (typeof items)[number]
      refreshing: boolean
    }> = []
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
        refreshing: 'orders',
      },
      slots: {
        item: (slotProps) => {
          received.push(
            slotProps as {
              active: boolean
              iconPath: string
              item: (typeof items)[number]
              refreshing: boolean
            },
          )

          return h('div', { class: 'slot-content' }, slotProps.item.text)
        },
      },
    })

    expect(received).toHaveLength(2)
    expect(received[0]).toEqual({
      item: items[0],
      active: true,
      refreshing: false,
      iconPath: '/icons/recommend-active.png',
    })
    expect(received[1]).toEqual({
      item: items[1],
      active: false,
      refreshing: true,
      iconPath: '/icons/orders.png',
    })
    expect(wrapper.findAll('.slot-content')).toHaveLength(2)
    expect(wrapper.find('.routerless-tabbar-text').exists()).toBe(false)
    expect(wrapper.find('.routerless-tabbar-icon').exists()).toBe(false)
  })

  it('使用 item 插槽后点击非当前 tab 仍 emits change', async () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
      slots: {
        item: ({ item }) => h('div', { class: 'slot-content' }, item.text),
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toEqual([['orders']])
  })

  it('使用 item 插槽后点击当前 tab 仍 emits retap', async () => {
    const wrapper = mount(RouterlessTabBar, {
      props: {
        active: 'recommend',
        items,
      },
      slots: {
        item: ({ item }) => h('div', { class: 'slot-content' }, item.text),
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[0]?.trigger('click')

    expect(wrapper.emitted('retap')).toEqual([['recommend']])
  })
})
