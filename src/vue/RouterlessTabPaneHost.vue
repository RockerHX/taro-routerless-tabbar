<template>
  <view :class="['routerless-tab-pane-host', hostClass]">
    <view
      v-for="pane in visitedItems"
      :key="pane.key"
      :class="[
        'routerless-tab-pane',
        paneClass,
        pane.key === active ? '' : 'routerless-tab-pane-hidden',
        pane.key === active ? '' : hiddenClass,
      ]"
    >
      <slot name="pane" :pane="pane" :active="pane.key === active" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

import type { RouterlessTabPaneItem } from '../types.js'

type ClassValue = string | string[] | Record<string, boolean>

const props = defineProps({
  items: {
    type: Array as PropType<readonly RouterlessTabPaneItem[]>,
    required: true,
  },
  active: {
    type: String,
    required: true,
  },
  visited: {
    type: Array as PropType<readonly string[]>,
    required: true,
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

const visitedItems = computed(function getVisitedItems() {
  return props.items.filter(function isVisitedItem(item) {
    return props.visited.includes(item.key)
  })
})
</script>

<style lang="scss">
.routerless-tab-pane-host {
  width: 100%;
}

.routerless-tab-pane {
  width: 100%;
}

.routerless-tab-pane-hidden {
  display: none;
}
</style>
