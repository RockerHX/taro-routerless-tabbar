import type { RouterlessTabQueryValue } from '../types.js'

export type TabPageModuleResolverOptions = {
  pageRoot?: string
  modulePrefix?: string
  extension?: string
}

export interface TabPageModuleResolver {
  (pagePath: string): string
}

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

export function createTabPageModuleResolver(
  options: TabPageModuleResolverOptions = {},
): TabPageModuleResolver {
  const pageRoot = normalizePageRoot(options.pageRoot ?? '/pages')
  const modulePrefix = normalizeModulePrefix(options.modulePrefix ?? '..')
  const extension = options.extension ?? '.vue'

  return function resolveTabPageModuleKeyWithOptions(pagePath: string): string {
    const normalizedPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`

    if (!normalizedPath.startsWith(`${pageRoot}/`)) {
      throw new Error(`Invalid tab pagePath: ${pagePath}`)
    }

    return `${modulePrefix}${normalizedPath.replace(pageRoot, '')}${extension}`
  }
}

const defaultTabPageModuleResolver = createTabPageModuleResolver()

export function resolveTabPageModuleKey(pagePath: string): string {
  return defaultTabPageModuleResolver(pagePath)
}

function normalizePageRoot(pageRoot: string): string {
  const normalizedRoot = pageRoot.startsWith('/') ? pageRoot : `/${pageRoot}`

  return normalizedRoot.replace(/\/+$/, '')
}

function normalizeModulePrefix(modulePrefix: string): string {
  return modulePrefix.replace(/\/+$/, '')
}
