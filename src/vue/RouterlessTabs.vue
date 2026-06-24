<template>
  <view class="routerless-tabs">
    <RouterlessTabPaneHost
      :items="tabs"
      :active="tabsState.activeKey.value"
      :visited="tabsState.visitedKeys.value"
      :host-class="hostClass"
      :pane-class="paneClass"
      :hidden-class="hiddenClass"
    >
      <template #pane="{ pane, active }">
        <slot name="pane" :pane="pane" :active="active">
          <component
            :is="resolvePaneComponent(pane)"
            embedded
            :active="active"
          />
        </slot>
      </template>
    </RouterlessTabPaneHost>

    <RouterlessTabBar
      :active="tabsState.activeKey.value"
      :items="tabs"
      :refreshing="refreshing"
      :refresh-icon="refreshIcon"
      @change="handleChange"
      @retap="handleRetap"
    >
      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>
    </RouterlessTabBar>
  </view>
</template>

<script setup lang="ts">
import type { Component, PropType } from 'vue'

import type { RouterlessTabPaneItem, RouterlessTabsItem } from '../types.js'
import RouterlessTabBar from './RouterlessTabBar.vue'
import RouterlessTabPaneHost from './RouterlessTabPaneHost.vue'
import { useRouterlessTabs } from './useRouterlessTabs.js'

type ClassValue = string | string[] | Record<string, boolean>
const props = defineProps({
  tabs: {
    type: Array as PropType<readonly RouterlessTabsItem[]>,
    required: true,
  },
  defaultKey: {
    type: String,
    required: true,
  },
  initialKey: {
    type: String,
    default: '',
  },
  refreshing: {
    type: String,
    default: '',
  },
  refreshIcon: {
    type: String,
    default: '',
  },
  hostClass: {
    type: [String, Array, Object] as PropType<ClassValue>,
    default: '',
  },
  paneClass: {
    type: [String, Array, Object] as PropType<ClassValue>,
    default: '',
  },
  hiddenClass: {
    type: [String, Array, Object] as PropType<ClassValue>,
    default: '',
  },
})

const emit = defineEmits<{
  change: [key: string]
  retap: [key: string]
}>()

const tabsState = useRouterlessTabs({
  tabs: props.tabs,
  defaultKey: props.defaultKey,
  initialKey: props.initialKey || undefined,
})

function resolvePaneComponent(pane: RouterlessTabPaneItem): Component {
  return (pane as RouterlessTabsItem).component
}

function handleChange(key: string) {
  tabsState.activateTab(key)
  emit('change', key)
}

function handleRetap(key: string) {
  emit('retap', key)
}
</script>
