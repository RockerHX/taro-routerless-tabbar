import type { RouterlessTabQueryValue } from '../types.js'

export function buildRouterlessTabUrl<Key extends string>(options: {
  mainPagePath: string
  tabKey: Key
  queryKey?: string
  query?: Record<string, RouterlessTabQueryValue>
}): string {
  const { mainPagePath, query, queryKey = 'tab', tabKey } = options
  const params = new URLSearchParams()

  params.append(queryKey, tabKey)

  Object.entries(query ?? {}).forEach(function appendQueryEntry([key, value]) {
    if (key === queryKey || value === null || value === undefined) {
      return
    }

    params.append(key, String(value))
  })

  return `${mainPagePath}?${params.toString()}`
}

export function resolveTabPageModuleKey(pagePath: string): string {
  const normalizedPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`

  if (!normalizedPath.startsWith('/pages/')) {
    throw new Error(`Invalid tab pagePath: ${pagePath}`)
  }

  return `..${normalizedPath.replace('/pages', '')}.vue`
}
