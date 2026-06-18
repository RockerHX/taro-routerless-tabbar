// @vitest-environment happy-dom

import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RouterlessTabPaneHost from './RouterlessTabPaneHost.vue'
import { useRouterlessTabs } from './useRouterlessTabs.js'

const panes = [
  { key: 'recommend', text: '推荐' },
  { key: 'orders', text: '订单' },
  { key: 'profile', text: '我的' },
] as const

describe('routerless main flow', () => {
  it('默认 tab 首屏可见，切换后已访问 pane 保留实例，retap 不修改 active', async () => {
    const mounts = {
      recommend: 0,
      orders: 0,
      profile: 0,
    }

    const paneComponents = {
      recommend: defineComponent({
        name: 'RecommendPane',
        setup() {
          mounts.recommend += 1
          return () =>
            h('div', { class: 'pane-inner pane-recommend' }, 'recommend')
        },
      }),
      orders: defineComponent({
        name: 'OrdersPane',
        setup() {
          mounts.orders += 1
          return () => h('div', { class: 'pane-inner pane-orders' }, 'orders')
        },
      }),
      profile: defineComponent({
        name: 'ProfilePane',
        setup() {
          mounts.profile += 1
          return () => h('div', { class: 'pane-inner pane-profile' }, 'profile')
        },
      }),
    } as const

    const wrapper = mount(
      defineComponent({
        components: {
          RouterlessTabPaneHost,
        },
        setup() {
          const tabs = useRouterlessTabs({
            tabs: panes,
            defaultKey: 'recommend',
          })

          return {
            tabs,
            paneComponents,
          }
        },
        template: `
          <RouterlessTabPaneHost
            :items="tabs.visitedTabs.value"
            :active="tabs.activeKey.value"
            :visited="tabs.visitedKeys.value"
          >
            <template #pane="{ pane, active }">
              <component
                :is="paneComponents[pane.key]"
                :data-active="String(active)"
              />
            </template>
          </RouterlessTabPaneHost>
        `,
      }),
    )

    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(1)
    expect(wrapper.find('.pane-recommend').exists()).toBe(true)
    expect(mounts).toEqual({
      recommend: 1,
      orders: 0,
      profile: 0,
    })

    await (
      wrapper.vm as unknown as {
        tabs: ReturnType<typeof useRouterlessTabs>
      }
    ).tabs.activateTab('orders')

    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(2)
    expect(wrapper.find('.pane-recommend').exists()).toBe(true)
    expect(wrapper.find('.pane-orders').exists()).toBe(true)
    expect(mounts).toEqual({
      recommend: 1,
      orders: 1,
      profile: 0,
    })

    const panesAfterOrders = wrapper.findAll('.routerless-tab-pane')
    expect(panesAfterOrders[0]?.classes()).toContain(
      'routerless-tab-pane-hidden',
    )
    expect(panesAfterOrders[1]?.classes()).not.toContain(
      'routerless-tab-pane-hidden',
    )

    await (
      wrapper.vm as unknown as {
        tabs: ReturnType<typeof useRouterlessTabs>
      }
    ).tabs.activateTab('recommend')

    expect(wrapper.findAll('.routerless-tab-pane')).toHaveLength(2)
    expect(mounts).toEqual({
      recommend: 1,
      orders: 1,
      profile: 0,
    })

    const retapResult = (
      wrapper.vm as unknown as {
        tabs: ReturnType<typeof useRouterlessTabs>
      }
    ).tabs.handleTabClick('recommend')

    expect(retapResult).toEqual({
      type: 'retap',
      key: 'recommend',
    })
    expect(
      (wrapper.vm as unknown as { tabs: ReturnType<typeof useRouterlessTabs> })
        .tabs.activeKey.value,
    ).toBe('recommend')
    expect(mounts).toEqual({
      recommend: 1,
      orders: 1,
      profile: 0,
    })
  })
})
