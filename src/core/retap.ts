import type {
  RetapAnimationListener,
  RetapRefreshContextOptions,
  RetapRefreshHandler,
} from '../types.js'

export const createRetapRefreshCore = <Key extends string>(
  options: RetapRefreshContextOptions<Key> = {},
) => {
  const { onError } = options
  const refreshHandlers = new Map<Key, RetapRefreshHandler>()
  const runningKeys = new Set<Key>()
  const animationListeners = new Set<RetapAnimationListener<Key>>()
  let animatingKey: Key | '' = ''

  const notifyAnimationListeners = () => {
    animationListeners.forEach((listener) => listener(animatingKey))
  }

  const registerRefreshHandler = (key: Key, handler: RetapRefreshHandler) => {
    refreshHandlers.set(key, handler)
  }

  const unregisterRefreshHandler = (
    key: Key,
    handler?: RetapRefreshHandler,
  ) => {
    if (!refreshHandlers.has(key)) {
      return
    }

    if (!handler || refreshHandlers.get(key) === handler) {
      refreshHandlers.delete(key)
    }
  }

  const getRefreshHandler = (key: Key) => refreshHandlers.get(key)

  const runRefresh = async (key: Key) => {
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

  const getAnimatingKey = () => animatingKey

  const startRefreshAnimation = (key: Key) => {
    if (animatingKey === key) {
      return false
    }

    animatingKey = key
    notifyAnimationListeners()
    return true
  }

  const stopRefreshAnimation = (key?: Key) => {
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

  const subscribeRefreshAnimation = (listener: RetapAnimationListener<Key>) => {
    animationListeners.add(listener)

    return () => {
      animationListeners.delete(listener)
    }
  }

  return {
    registerRefreshHandler,
    unregisterRefreshHandler,
    getRefreshHandler,
    runRefresh,
    getAnimatingKey,
    startRefreshAnimation,
    stopRefreshAnimation,
    subscribeRefreshAnimation,
  }
}
