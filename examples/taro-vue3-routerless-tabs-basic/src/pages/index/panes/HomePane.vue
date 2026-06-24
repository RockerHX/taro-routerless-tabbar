<template>
  <view class="basic-pane">
    <text class="basic-pane-title">首页</text>
    <text class="basic-pane-desc">默认展示推荐内容，首次进入时自动挂载。</text>
    <text class="basic-pane-meta"
      >embedded: {{ embedded ? 'true' : 'false' }}</text
    >
    <text class="basic-pane-meta">active: {{ active ? 'true' : 'false' }}</text>
    <text class="basic-pane-meta">本地计数：{{ count }}</text>
    <view class="basic-pane-button" @click="count += 1">
      <text>增加首页本地状态</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  embedded?: boolean
  active?: boolean
}>()

const count = ref(0)
</script>

<style scoped>
.basic-pane {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgb(15 23 42 / 6%);
}

.basic-pane-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.basic-pane-desc,
.basic-pane-meta {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #475569;
}

.basic-pane-button {
  margin-top: 20rpx;
  padding: 22rpx 24rpx;
  border-radius: 20rpx;
  background: #e2e8f0;
  color: #0f172a;
}
</style>
