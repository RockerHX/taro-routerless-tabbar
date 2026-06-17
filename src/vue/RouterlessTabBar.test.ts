// @vitest-environment happy-dom

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
})
