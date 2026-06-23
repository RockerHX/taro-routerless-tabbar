import type { KeyedTabItem } from '../types.js';
export declare function getTabKeys<const Item extends KeyedTabItem<string>>(tabs: readonly Item[]): Array<Item['key']>;
export declare function isTabKey<Key extends string>(value: string, tabKeys: readonly Key[]): value is Key;
export declare function normalizeTabKey<Key extends string>(options: {
    value?: string;
    tabKeys: readonly Key[];
    defaultKey: Key;
    aliases?: Partial<Record<string, Key>>;
}): Key;
export declare function createVisitedTabRecord<Key extends string>(options: {
    tabKeys: readonly Key[];
    defaultKey: Key;
}): Record<Key, boolean>;
export declare function getVisitedTabs<Key extends string, Item extends KeyedTabItem<Key>>(tabs: readonly Item[], visited: Partial<Record<Key, boolean>>): Item[];
