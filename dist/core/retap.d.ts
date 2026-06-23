import type { RetapAnimationListener, RetapRefreshContextOptions, RetapRefreshHandler } from '../types.js';
export declare function createRetapRefreshCore<Key extends string>(options?: RetapRefreshContextOptions<Key>): {
    registerRefreshHandler: (key: Key, handler: RetapRefreshHandler) => void;
    unregisterRefreshHandler: (key: Key, handler?: RetapRefreshHandler) => void;
    getRefreshHandler: (key: Key) => RetapRefreshHandler | undefined;
    runRefresh: (key: Key) => Promise<boolean>;
    getAnimatingKey: () => "" | Key;
    startRefreshAnimation: (key: Key) => boolean;
    stopRefreshAnimation: (key?: Key) => boolean;
    subscribeRefreshAnimation: (listener: RetapAnimationListener<Key>) => () => void;
};
