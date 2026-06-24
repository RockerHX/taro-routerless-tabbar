<template>
  <view class="fixture-detail-page">
    <text class="fixture-detail-title" data-testid="detail-title">
      Fixture 详情页
    </text>
    <text class="fixture-detail-meta" data-testid="detail-tab">
      来源 Tab：{{ tab }}
    </text>
    <text class="fixture-detail-meta" data-testid="detail-from">
      来源参数：{{ from }}
    </text>
    <view
      class="fixture-detail-back"
      data-testid="detail-back"
      @click="goBack"
    >
      <text>返回主容器</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useLoad } from '@tarojs/taro'
import { ref } from 'vue'

const tab = ref('')
const from = ref('')

function goBack() {
  void Taro.navigateBack()
}

useLoad((query: Record<string, string | undefined>) => {
  tab.value = String(query.tab ?? '')
  from.value = String(query.from ?? '')
})
</script>

<style>
.fixture-detail-page {
  min-height: 100vh;
  padding: 32px 24px;
  background: #f7f8fa;
}

.fixture-detail-title,
.fixture-detail-meta {
  display: block;
  margin-bottom: 16px;
  color: #1f2329;
  font-size: 28px;
}

.fixture-detail-meta {
  color: #4e5969;
  font-size: 22px;
}

.fixture-detail-back {
  display: inline-flex;
  margin-top: 24px;
  padding: 14px 22px;
  border-radius: 999px;
  background: #f75d5b;
  color: #fff;
  font-size: 24px;
}
</style>
