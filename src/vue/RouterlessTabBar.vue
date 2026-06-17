<template>
  <view class="routerless-tabbar">
    <view
      v-for="item in items"
      :key="item.key"
      :class="[
        'routerless-tabbar-item',
        item.key === active ? 'routerless-tabbar-item-active' : '',
      ]"
      @click="onTabClick(item)"
    >
      <image
        v-if="resolveIconPath(item)"
        class="routerless-tabbar-icon"
        mode="scaleToFill"
        :src="resolveIconPath(item)"
      />
      <text class="routerless-tabbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import { resolveTabClick } from '../core/click.js'
import type { RouterlessTabBarItem } from '../types.js'

const props = defineProps({
  active: {
    type: String,
    required: true,
  },
  items: {
    type: Array as PropType<readonly RouterlessTabBarItem[]>,
    required: true,
  },
  refreshing: {
    type: String,
    default: '',
  },
  refreshIcon: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change', 'retap'])

const resolveIconPath = (item: RouterlessTabBarItem) =>
  item.key === props.active
    ? (item.selectedIconPath ?? item.iconPath ?? '')
    : (item.iconPath ?? '')

const onTabClick = (item: RouterlessTabBarItem) => {
  const result = resolveTabClick(props.active, item.key)

  if (result.type === 'retap') {
    emit('retap', result.key)
    return
  }

  emit('change', result.key)
}
</script>
