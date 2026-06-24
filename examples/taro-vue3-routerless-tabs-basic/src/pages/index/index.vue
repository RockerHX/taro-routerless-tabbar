<template>
  <view class="basic-page">
    <view class="basic-hero">
      <text class="basic-title">RouterlessTabs 极简示例</text>
      <text class="basic-desc">
        这个页面只演示最小接入：传入 tabs 和 defaultKey，默认底栏切换与 pane 保活由组件内部处理。
      </text>
    </view>

    <RouterlessTabs :tabs="tabs" default-key="home" />
  </view>
</template>

<script setup lang="ts">
import { RouterlessTabs } from 'taro-routerless-tabbar'

import HomePane from './panes/HomePane.vue'
import OrderPane from './panes/OrderPane.vue'
import ProfilePane from './panes/ProfilePane.vue'

const tabs = [
  { key: 'home', text: '首页', component: HomePane },
  { key: 'order', text: '订单', component: OrderPane },
  { key: 'profile', text: '我的', component: ProfilePane },
] as const
</script>

<style scoped>
.basic-page {
  min-height: 100vh;
  padding: 32rpx 24rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: linear-gradient(180deg, #f5f7fb 0%, #ffffff 52%);
}

.basic-hero {
  margin-bottom: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgb(15 23 42 / 8%);
}

.basic-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
}

.basic-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #475569;
}
</style>
