import { onUnmounted, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { createRetapRefreshCore } from '../core/retap.js'
import type {
  RetapRefreshContextOptions,
  RetapRefreshHandler,
} from '../types.js'

export function createRetapRefreshContext<Key extends string>(
  options: RetapRefreshContextOptions<Key> = {},
) {
  const core = createRetapRefreshCore<Key>(options)

  function useRetapRefresh(
    key: Key,
    handler: RetapRefreshHandler,
    enabled: MaybeRefOrGetter<boolean> = true,
  ) {
    let registered = false

    function syncRegistration(nextEnabled: boolean) {
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
      function getEnabledValue() {
        return Boolean(toValue(enabled))
      },
      function handleEnabledChange(nextEnabled) {
        syncRegistration(nextEnabled)
      },
      { immediate: true },
    )

    onUnmounted(function cleanupRetapRefresh() {
      stopWatching()
      core.unregisterRefreshHandler(key, handler)
      registered = false
    })
  }

  function useRetapRefreshAnimation(key: Key) {
    function startRefreshAnimation() {
      return core.startRefreshAnimation(key)
    }

    function stopRefreshAnimation() {
      return core.stopRefreshAnimation(key)
    }

    onUnmounted(function cleanupRefreshAnimation() {
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
