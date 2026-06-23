import type { KeyedTabItem, UseRouterlessTabsOptions, UseRouterlessTabsResult } from '../types.js';
export declare function useRouterlessTabs<Item extends KeyedTabItem<string>>(options: UseRouterlessTabsOptions<Item['key'], Item>): UseRouterlessTabsResult<Item['key'], Item>;
