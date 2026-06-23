import type { MaybeRefOrGetter } from 'vue';
import type { RetapRefreshContextOptions, RetapRefreshHandler } from '../types.js';
export declare function createRetapRefreshContext<Key extends string>(options?: RetapRefreshContextOptions<Key>): {
    useRetapRefresh: (key: Key, handler: RetapRefreshHandler, enabled?: MaybeRefOrGetter<boolean>) => void;
    useRetapRefreshAnimation: (key: Key) => {
        startRefreshAnimation: () => boolean;
        stopRefreshAnimation: () => boolean;
    };
    registerRefreshHandler: (key: Key, handler: RetapRefreshHandler) => void;
    unregisterRefreshHandler: (key: Key, handler?: RetapRefreshHandler) => void;
    getRefreshHandler: (key: Key) => RetapRefreshHandler | undefined;
    runRefresh: (key: Key) => Promise<boolean>;
    getAnimatingKey: () => "" | Key;
    startRefreshAnimation: (key: Key) => boolean;
    stopRefreshAnimation: (key?: Key | undefined) => boolean;
    subscribeRefreshAnimation: (listener: import("../types.js").RetapAnimationListener<Key>) => () => void;
};
