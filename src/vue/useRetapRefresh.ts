import { onUnmounted, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { createRetapRefreshCore } from '../core/retap.js'
import type {
  RetapRefreshContextOptions,
  RetapRefreshHandler,
} from '../types.js'

export const createRetapRefreshContext = <Key extends string>(
  options: RetapRefreshContextOptions<Key> = {},
) => {
  const core = createRetapRefreshCore<Key>(options)

  const useRetapRefresh = (
    key: Key,
    handler: RetapRefreshHandler,
    enabled: MaybeRefOrGetter<boolean> = true,
  ) => {
    let registered = false

    const syncRegistration = (nextEnabled: boolean) => {
      if (nextEnabled) {
        core.registerRefreshHandler(key, handler)
        registered = true
        return
      }

      if (registered) {
        core.unregisterRefreshHandler(key, handler)
        registered = false
      }
    }

    const stopWatching = watch(
      () => Boolean(toValue(enabled)),
      (nextEnabled) => {
        syncRegistration(nextEnabled)
      },
      { immediate: true },
    )

    onUnmounted(() => {
      stopWatching()
      core.unregisterRefreshHandler(key, handler)
      registered = false
    })
  }

  const useRetapRefreshAnimation = (key: Key) => {
    const startRefreshAnimation = () => core.startRefreshAnimation(key)
    const stopRefreshAnimation = () => core.stopRefreshAnimation(key)

    onUnmounted(() => {
      stopRefreshAnimation()
    })

    return {
      startRefreshAnimation,
      stopRefreshAnimation,
    }
  }

  return {
    ...core,
    useRetapRefresh,
    useRetapRefreshAnimation,
  }
}
