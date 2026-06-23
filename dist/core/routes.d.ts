import type { RouterlessTabQueryValue } from '../types.js';
export declare function buildRouterlessTabUrl<Key extends string>(options: {
    mainPagePath: string;
    tabKey: Key;
    queryKey?: string;
    query?: Record<string, RouterlessTabQueryValue>;
}): string;
export declare function resolveTabPageModuleKey(pagePath: string): string;
