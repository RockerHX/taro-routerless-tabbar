<template>
  <view class="standalone-tab-page">
    <text class="standalone-tab-title">正在打开首页...</text>
  </view>
</template>

<script setup lang="ts">
import Taro, { useLoad } from '@tarojs/taro'
import { resolveStandaloneTabRedirect } from 'taro-routerless-tabbar'

useLoad((query: Record<string, string | undefined>) => {
  const redirect = resolveStandaloneTabRedirect({
    mainPagePath: '/pages/index/index',
    tabKey: 'home',
    currentQuery: query,
  })

  if (redirect.shouldRedirect) {
    Taro.redirectTo({
      url: redirect.url,
    })
  }
})
</script>

<style>
.standalone-tab-page {
  min-height: 100vh;
  padding: 32px 24px;
  background: #f7f8fa;
}

.standalone-tab-title {
  color: #1f2329;
  font-size: 28px;
}
</style>
