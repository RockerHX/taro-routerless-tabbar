import type { RouterlessTabQueryValue } from '../types.js'

export function buildRouterlessTabUrl<Key extends string>(options: {
  mainPagePath: string
  tabKey: Key
  queryKey?: string
  query?: Record<string, RouterlessTabQueryValue>
}): string {
  const { mainPagePath, query, queryKey = 'tab', tabKey } = options
  const hashIndex = mainPagePath.indexOf('#')
  const pathWithQuery =
    hashIndex >= 0 ? mainPagePath.slice(0, hashIndex) : mainPagePath
  const hash = hashIndex >= 0 ? mainPagePath.slice(hashIndex) : ''
  const queryIndex = pathWithQuery.indexOf('?')
  const path =
    queryIndex >= 0 ? pathWithQuery.slice(0, queryIndex) : pathWithQuery
  const existingQuery =
    queryIndex >= 0 ? pathWithQuery.slice(queryIndex + 1) : ''
  const existingParams = new URLSearchParams(existingQuery)
  const params = new URLSearchParams()
  const overridingQueryKeys = new Set(
    Object.entries(query ?? {})
      .filter(function isOverridingQueryEntry([key, value]) {
        return key !== queryKey && value !== null && value !== undefined
      })
      .map(function getOverridingQueryKey([key]) {
        return key
      }),
  )

  params.append(queryKey, tabKey)

  existingParams.forEach(function appendExistingQueryEntry(value, key) {
    if (key === queryKey || overridingQueryKeys.has(key)) {
      return
    }

    params.append(key, value)
  })

  Object.entries(query ?? {}).forEach(function appendQueryEntry([key, value]) {
    if (key === queryKey || value === null || value === undefined) {
      return
    }

    params.append(key, String(value))
  })

  return `${path}?${params.toString()}${hash}`
}

export function resolveTabPageModuleKey(pagePath: string): string {
  const normalizedPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`

  if (!normalizedPath.startsWith('/pages/')) {
    throw new Error(`Invalid tab pagePath: ${pagePath}`)
  }

  return `..${normalizedPath.replace('/pages', '')}.vue`
}
