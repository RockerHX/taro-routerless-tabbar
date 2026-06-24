// @vitest-environment happy-dom
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RouterlessTabs from './RouterlessTabs.vue'

const mountCounts = {
  recommend: 0,
  orders: 0,
  profile: 0,
}

function createPaneComponent(key: keyof typeof mountCounts) {
  return defineComponent({
    name: `${key}Pane`,
    props: {
      embedded: {
        type: Boolean,
        default: false,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      mountCounts[key] += 1

      return function renderPane() {
        return h(
          'div',
          {
            class: `pane-${key}`,
            'data-active': String(props.active),
            'data-embedded': String(props.embedded),
          },
          key,
        )
      }
    },
  })
}

const panes = [
  {
    key: 'recommend',
    text: '推荐',
    iconPath: '/icons/recommend.png',
    selectedIconPath: '/icons/recommend-active.png',
    component: createPaneComponent('recommend'),
  },
  {
    key: 'orders',
    text: '订单',
    iconPath: '/icons/orders.png',
    selectedIconPath: '/icons/orders-active.png',
    component: createPaneComponent('orders'),
  },
  {
    key: 'profile',
    text: '我的',
    component: createPaneComponent('profile'),
  },
] as const

function resetMountCounts() {
  mountCounts.recommend = 0
  mountCounts.orders = 0
  mountCounts.profile = 0
}

describe('RouterlessTabs', function () {
  it('默认只渲染 defaultKey pane，并给默认 component 传入 embedded 和 active', function () {
    resetMountCounts()

    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
      },
    })

    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(1)
    expect(wrapper.find('.pane-recommend').exists()).toBe(true)
    expect(wrapper.find('.pane-recommend').attributes('data-embedded')).toBe(
      'true',
    )
    expect(wrapper.find('.pane-recommend').attributes('data-active')).toBe(
      'true',
    )
    expect(mountCounts).toEqual({
      recommend: 1,
      orders: 0,
      profile: 0,
    })
  })

  it('点击非当前 Tab 后切换 active、标记 visited，并保留旧 pane 实例', async function () {
    resetMountCounts()

    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toEqual([['orders']])
    expect(wrapper.emitted('retap')).toBeUndefined()
    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(2)
    expect(wrapper.find('.pane-recommend').attributes('data-active')).toBe(
      'false',
    )
    expect(wrapper.find('.pane-orders').attributes('data-active')).toBe('true')
    expect(wrapper.find('.pane-orders').attributes('data-embedded')).toBe(
      'true',
    )
    expect(mountCounts).toEqual({
      recommend: 1,
      orders: 1,
      profile: 0,
    })

    const renderedPanes = wrapper.findAll('.routerless-tab-pane')
    expect(renderedPanes[0]?.classes()).toContain('routerless-tab-pane-hidden')
    expect(renderedPanes[1]?.classes()).not.toContain(
      'routerless-tab-pane-hidden',
    )
  })

  it('点击当前 Tab 派发 retap，且不改变 active 或 visited', async function () {
    resetMountCounts()

    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
      },
    })

    await wrapper.findAll('.routerless-tabbar-item')[0]?.trigger('click')

    expect(wrapper.emitted('retap')).toEqual([['recommend']])
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(1)
    expect(wrapper.find('.pane-recommend').attributes('data-active')).toBe(
      'true',
    )
    expect(mountCounts).toEqual({
      recommend: 1,
      orders: 0,
      profile: 0,
    })
  })

  it('支持 pane slot 完全覆盖默认 pane component 渲染', function () {
    resetMountCounts()
    const received: Array<{ key: string; active: boolean }> = []

    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
      },
      slots: {
        pane({ pane, active }) {
          received.push({ key: pane.key, active })
          return h(
            'div',
            { class: 'custom-pane', 'data-active': String(active) },
            pane.text,
          )
        },
      },
    })

    expect(wrapper.find('.custom-pane').exists()).toBe(true)
    expect(wrapper.find('.pane-recommend').exists()).toBe(false)
    expect(received).toEqual([{ key: 'recommend', active: true }])
    expect(mountCounts).toEqual({
      recommend: 0,
      orders: 0,
      profile: 0,
    })
  })

  it('支持 item slot 自定义底栏项，且点击事件仍生效', async function () {
    const received: Array<{
      active: boolean
      iconPath: string
      item: (typeof panes)[number]
      refreshing: boolean
    }> = []
    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
        refreshing: 'orders',
      },
      slots: {
        item(slotProps) {
          received.push(
            slotProps as {
              active: boolean
              iconPath: string
              item: (typeof panes)[number]
              refreshing: boolean
            },
          )
          return h('div', { class: 'custom-tabbar-item' }, slotProps.item.text)
        },
      },
    })

    expect(received[0]).toEqual({
      item: panes[0],
      active: true,
      refreshing: false,
      iconPath: '/icons/recommend-active.png',
    })
    expect(received[1]).toEqual({
      item: panes[1],
      active: false,
      refreshing: true,
      iconPath: '/icons/orders.png',
    })
    expect(wrapper.findAll('.custom-tabbar-item')).toHaveLength(3)

    await wrapper.findAll('.routerless-tabbar-item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toEqual([['orders']])
  })

  it('透传 class、refreshing 和 refreshIcon props 到内部组件', function () {
    const wrapper = mount(RouterlessTabs, {
      props: {
        tabs: panes,
        defaultKey: 'recommend',
        initialKey: 'orders',
        refreshing: 'orders',
        refreshIcon: '/icons/refresh.svg',
        hostClass: 'custom-host',
        paneClass: ['custom-pane', 'custom-pane-extra'],
        hiddenClass: {
          'custom-hidden': true,
          'custom-hidden-disabled': false,
        },
      },
    })

    const host = wrapper.find('.routerless-tab-pane-host')
    const renderedPanes = wrapper.findAll('.routerless-tab-pane')
    const tabbarItems = wrapper.findAll('.routerless-tabbar-item')

    expect(host.classes()).toContain('custom-host')
    expect(renderedPanes[0]?.classes()).toContain('custom-pane')
    expect(renderedPanes[0]?.classes()).toContain('custom-pane-extra')
    expect(renderedPanes[0]?.classes()).toContain('custom-hidden')
    expect(renderedPanes[0]?.classes()).not.toContain('custom-hidden-disabled')
    expect(renderedPanes[1]?.classes()).toContain('custom-pane')
    expect(renderedPanes[1]?.classes()).not.toContain('custom-hidden')
    expect(tabbarItems[1]?.classes()).toContain(
      'routerless-tabbar-item-refreshing',
    )
    expect(
      tabbarItems[1]?.find('.routerless-tabbar-refresh-icon').attributes('src'),
    ).toBe('/icons/refresh.svg')
  })
})
