<template>
  <view class="routerless-tab-pane-host">
    <view
      v-for="pane in visitedItems"
      :key="pane.key"
      :class="[
        'routerless-tab-pane',
        pane.key === active ? '' : 'routerless-tab-pane-hidden',
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
})

const visitedItems = computed(() =>
  props.items.filter((item) => props.visited.includes(item.key)),
)
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
