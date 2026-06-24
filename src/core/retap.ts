import type {
  RetapAnimationListener,
  RetapRefreshContextOptions,
  RetapRefreshHandler,
} from '../types.js'

export function createRetapRefreshCore<Key extends string>(
  options: RetapRefreshContextOptions<Key> = {},
) {
  const { onError } = options
  const refreshHandlers = new Map<Key, RetapRefreshHandler>()
  const runningKeys = new Set<Key>()
  const animationListeners = new Set<RetapAnimationListener<Key>>()
  let animatingKey: Key | '' = ''

  function notifyAnimationListeners() {
    animationListeners.forEach(function notifyAnimationListener(listener) {
      listener(animatingKey)
    })
  }

  function registerRefreshHandler(key: Key, handler: RetapRefreshHandler) {
    refreshHandlers.set(key, handler)
  }

  function unregisterRefreshHandler(key: Key, handler?: RetapRefreshHandler) {
    if (!refreshHandlers.has(key)) {
      return
    }

    if (!handler || refreshHandlers.get(key) === handler) {
      refreshHandlers.delete(key)
    }
  }

  function getRefreshHandler(key: Key) {
    return refreshHandlers.get(key)
  }

  function hasRefreshHandler(key: Key) {
    return refreshHandlers.has(key)
  }

  function isRefreshRunning(key: Key) {
    return runningKeys.has(key)
  }

  async function runRefresh(key: Key) {
    if (runningKeys.has(key)) {
      return false
    }

    try {
      const handler = getRefreshHandler(key)

      if (!handler) {
        return false
      }

      runningKeys.add(key)

      try {
        await handler()
      } finally {
        runningKeys.delete(key)
      }
    } catch (error) {
      onError?.(error, key)
    }

    return true
  }

  function getAnimatingKey() {
    return animatingKey
  }

  function startRefreshAnimation(key: Key) {
    if (animatingKey === key) {
      return false
    }

    animatingKey = key
    notifyAnimationListeners()
    return true
  }

  function stopRefreshAnimation(key?: Key) {
    if (!animatingKey) {
      return false
    }

    if (key && animatingKey !== key) {
      return false
    }

    animatingKey = ''
    notifyAnimationListeners()
    return true
  }

  function subscribeRefreshAnimation(listener: RetapAnimationListener<Key>) {
    animationListeners.add(listener)

    return function unsubscribeRefreshAnimation() {
      animationListeners.delete(listener)
    }
  }

  return {
    registerRefreshHandler,
    unregisterRefreshHandler,
    getRefreshHandler,
    hasRefreshHandler,
    isRefreshRunning,
    runRefresh,
    getAnimatingKey,
    startRefreshAnimation,
    stopRefreshAnimation,
    subscribeRefreshAnimation,
  }
}
