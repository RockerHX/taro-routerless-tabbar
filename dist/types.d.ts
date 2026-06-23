export type KeyedTabItem<Key extends string = string> = {
    key: Key;
};
export type RouterlessTabPaneItem<Key extends string = string> = KeyedTabItem<Key>;
export type RouterlessTabBarItem<Key extends string = string> = KeyedTabItem<Key> & {
    text: string;
    iconPath?: string;
    selectedIconPath?: string;
};
export type TabClickResult<Key extends string> = {
    type: 'change';
    key: Key;
} | {
    type: 'retap';
    key: Key;
};
export type RouterlessTabQueryValue = string | number | boolean | null | undefined;
export interface RetapRefreshHandler {
    (): void | Promise<void>;
}
export interface RetapAnimationListener<Key extends string> {
    (key: Key | ''): void;
}
export type RetapRefreshContextOptions<Key extends string> = {
    onError?(error: unknown, key: Key): void;
};
export type UseRouterlessTabsOptions<Key extends string, Item extends KeyedTabItem<Key>> = {
    tabs: readonly Item[];
    defaultKey: Key;
    initialKey?: Key;
};
export type UseRouterlessTabsResult<Key extends string, Item extends KeyedTabItem<Key>> = {
    activeKey: import('vue').Ref<Key>;
    activeTab: import('vue').ComputedRef<Item | undefined>;
    visitedKeys: import('vue').ComputedRef<Key[]>;
    visitedTabs: import('vue').ComputedRef<Item[]>;
    activateTab(key: Key): Key;
    handleTabClick(key: Key): TabClickResult<Key>;
    isVisited(key: Key): boolean;
    isActive(key: Key): boolean;
    resetVisited(): void;
};
