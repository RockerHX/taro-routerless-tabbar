<template>
  <view class="basic-pane">
    <text class="basic-pane-title">订单</text>
    <text class="basic-pane-desc"
      >切到其他 Tab 再回来时，这里的本地状态会继续保留。</text
    >
    <text class="basic-pane-meta"
      >embedded: {{ embedded ? 'true' : 'false' }}</text
    >
    <text class="basic-pane-meta">active: {{ active ? 'true' : 'false' }}</text>
    <text class="basic-pane-meta">已筛选订单数：{{ count }}</text>
    <view class="basic-pane-button" @click="count += 1">
      <text>增加订单筛选状态</text>
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
  background: #dbeafe;
  color: #1d4ed8;
}
</style>
