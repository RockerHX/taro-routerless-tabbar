<template>
  <view class="routerless-tabbar">
    <view
      v-for="item in items"
      :key="item.key"
      :class="[
        'routerless-tabbar-item',
        item.key === active ? 'routerless-tabbar-item-active' : '',
        isItemRefreshing(item.key) ? 'routerless-tabbar-item-refreshing' : '',
      ]"
      @click="onTabClick(item)"
    >
      <slot
        name="item"
        :item="item"
        :active="item.key === active"
        :refreshing="isItemRefreshing(item.key)"
        :icon-path="resolveIconPath(item)"
      >
        <template v-if="isItemRefreshing(item.key) && refreshIcon">
          <image
            class="routerless-tabbar-refresh-icon"
            mode="scaleToFill"
            :src="refreshIcon"
          />
        </template>
        <template v-else>
          <image
            v-if="resolveIconPath(item)"
            class="routerless-tabbar-icon"
            mode="scaleToFill"
            :src="resolveIconPath(item)"
          />
          <text class="routerless-tabbar-text">{{ item.text }}</text>
        </template>
      </slot>
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

const emit = defineEmits<{
  change: [key: string]
  retap: [key: string]
}>()

function isItemRefreshing(key: string) {
  return props.refreshing === key
}

function resolveIconPath(item: RouterlessTabBarItem) {
  return item.key === props.active
    ? (item.selectedIconPath ?? item.iconPath ?? '')
    : (item.iconPath ?? '')
}

function onTabClick(item: RouterlessTabBarItem) {
  const result = resolveTabClick(props.active, item.key)

  if (result.type === 'retap') {
    emit('retap', result.key)
    return
  }

  emit('change', result.key)
}
</script>

<style src="./RouterlessTabBar.scss" lang="scss"></style>
