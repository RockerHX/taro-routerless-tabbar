<template>
  <view class="basic-pane">
    <text class="basic-pane-title">我的</text>
    <text class="basic-pane-desc">适合放个人中心、设置入口或账户信息。</text>
    <text class="basic-pane-meta"
      >embedded: {{ embedded ? 'true' : 'false' }}</text
    >
    <text class="basic-pane-meta">active: {{ active ? 'true' : 'false' }}</text>
    <text class="basic-pane-meta">已展开入口数：{{ count }}</text>
    <view class="basic-pane-button" @click="count += 1">
      <text>增加个人中心本地状态</text>
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
  background: #ede9fe;
  color: #6d28d9;
}
</style>
