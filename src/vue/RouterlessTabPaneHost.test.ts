// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RouterlessTabPaneHost from './RouterlessTabPaneHost.vue'
const items = [
  { key: 'recommend', text: '推荐' },
  { key: 'orders', text: '订单' },
  { key: 'profile', text: '我的' },
] as const
describe('RouterlessTabPaneHost', function () {
  it('仅渲染 visited panes', function () {
    const wrapper = mount(RouterlessTabPaneHost, {
      props: {
        items,
        active: 'recommend',
        visited: ['recommend', 'profile'],
      },
      slots: {
        pane: function ({ pane }) {
          return h(
            'div',
            { class: 'pane-slot' },
            (pane as (typeof items)[number]).text,
          )
        },
      },
    })
    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(2)
    expect(wrapper.text()).toContain('推荐')
    expect(wrapper.text()).toContain('我的')
    expect(wrapper.text()).not.toContain('订单')
  })
  it('active pane 暴露 active=true，非 active pane 暴露 false', function () {
    const received: Array<{
      key: string
      active: boolean
    }> = []
    mount(RouterlessTabPaneHost, {
      props: {
        items,
        active: 'orders',
        visited: ['recommend', 'orders'],
      },
      slots: {
        pane: function ({ pane, active }) {
          const typedPane = pane as (typeof items)[number]
          received.push({ key: typedPane.key, active })
          return h('div', typedPane.text)
        },
      },
    })
    expect(received).toEqual([
      { key: 'recommend', active: false },
      { key: 'orders', active: true },
    ])
  })
  it('非 active pane 仅隐藏不移除', function () {
    const wrapper = mount(RouterlessTabPaneHost, {
      props: {
        items,
        active: 'orders',
        visited: ['recommend', 'orders'],
      },
      slots: {
        pane: function ({ pane }) {
          return h(
            'div',
            { class: 'pane-slot' },
            (pane as (typeof items)[number]).text,
          )
        },
      },
    })
    const panes = wrapper.findAll('.routerless-tab-pane')
    expect(panes).toHaveLength(2)
    expect(panes[0]?.classes()).toContain('routerless-tab-pane-hidden')
    expect(panes[1]?.classes()).not.toContain('routerless-tab-pane-hidden')
  })
  it('slot 能收到完整 pane 数据', function () {
    const received: Array<(typeof items)[number]> = []
    mount(RouterlessTabPaneHost, {
      props: {
        items,
        active: 'profile',
        visited: ['profile'],
      },
      slots: {
        pane: function ({ pane }) {
          const typedPane = pane as (typeof items)[number]
          received.push(typedPane)
          return h('div', typedPane.text)
        },
      },
    })
    expect(received).toEqual([items[2]])
  })
})
