import { createRetapRefreshContext } from 'taro-routerless-tabbar'

import type { TabKey } from './tabbar'

export const fixtureRetap = createRetapRefreshContext<TabKey>({
  onError(error, key) {
    console.error(`[fixture retap] ${key} refresh failed`, error)
  },
})

export const useFixtureRetapRefresh = fixtureRetap.useRetapRefresh
export const useFixtureRetapRefreshAnimation =
  fixtureRetap.useRetapRefreshAnimation
