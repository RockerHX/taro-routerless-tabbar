import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const expectedExports = ['.', './core', './vue', './style.css']
const expectedSurface = {
  'src/index.ts': [
    'KeyedTabItem',
    'RetapAnimationListener',
    'RetapRefreshContextOptions',
    'RetapRefreshHandler',
    'RouterlessTabBar',
    'RouterlessTabBarItem',
    'RouterlessTabPaneHost',
    'RouterlessTabPaneItem',
    'RouterlessTabQueryValue',
    'StandaloneTabRedirectOptions',
    'StandaloneTabRedirectResult',
    'TabClickResult',
    'TabPageModuleResolver',
    'TabPageModuleResolverOptions',
    'UseRouterlessTabsOptions',
    'UseRouterlessTabsResult',
    'buildRouterlessTabUrl',
    'createRetapRefreshContext',
    'createRetapRefreshCore',
    'createTabPageModuleResolver',
    'createVisitedTabRecord',
    'getTabKeys',
    'getVisitedTabs',
    'isTabKey',
    'normalizeTabKey',
    'resolveStandaloneTabRedirect',
    'resolveTabClick',
    'resolveTabPageModuleKey',
    'useRouterlessTabs',
  ],
  'src/core.ts': [
    'KeyedTabItem',
    'RetapAnimationListener',
    'RetapRefreshContextOptions',
    'RetapRefreshHandler',
    'RouterlessTabQueryValue',
    'StandaloneTabRedirectOptions',
    'StandaloneTabRedirectResult',
    'TabClickResult',
    'TabPageModuleResolver',
    'TabPageModuleResolverOptions',
    'buildRouterlessTabUrl',
    'createRetapRefreshCore',
    'createTabPageModuleResolver',
    'createVisitedTabRecord',
    'getTabKeys',
    'getVisitedTabs',
    'isTabKey',
    'normalizeTabKey',
    'resolveStandaloneTabRedirect',
    'resolveTabClick',
    'resolveTabPageModuleKey',
  ],
  'src/vue.ts': [
    'KeyedTabItem',
    'RetapAnimationListener',
    'RetapRefreshContextOptions',
    'RetapRefreshHandler',
    'RouterlessTabBar',
    'RouterlessTabBarItem',
    'RouterlessTabPaneHost',
    'RouterlessTabPaneItem',
    'TabClickResult',
    'UseRouterlessTabsOptions',
    'UseRouterlessTabsResult',
    'createRetapRefreshContext',
    'useRouterlessTabs',
  ],
}

const coreOnlyNames = [
  'RouterlessTabQueryValue',
  'StandaloneTabRedirectOptions',
  'StandaloneTabRedirectResult',
  'TabPageModuleResolver',
  'TabPageModuleResolverOptions',
  'buildRouterlessTabUrl',
  'createRetapRefreshCore',
  'createTabPageModuleResolver',
  'createVisitedTabRecord',
  'getTabKeys',
  'getVisitedTabs',
  'isTabKey',
  'normalizeTabKey',
  'resolveStandaloneTabRedirect',
  'resolveTabClick',
  'resolveTabPageModuleKey',
]
const vueOnlyNames = [
  'RouterlessTabBar',
  'RouterlessTabPaneHost',
  'createRetapRefreshContext',
  'useRouterlessTabs',
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function formatList(values) {
  return values.length === 0 ? '(none)' : values.join(', ')
}

function assertSameList(actual, expected, label) {
  const actualList = uniqueSorted(actual)
  const expectedList = uniqueSorted(expected)
  const missing = expectedList.filter((name) => !actualList.includes(name))
  const extra = actualList.filter((name) => !expectedList.includes(name))

  assert(
    missing.length === 0 && extra.length === 0,
    `${label} API surface changed. Missing: ${formatList(missing)}. Extra: ${formatList(extra)}.`,
  )
}

function parseNamedExports(filePath) {
  const source = readFileSync(path.join(rootDir, filePath), 'utf8')
  const names = []
  const exportBlockPattern =
    /export\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+['"][^'"]+['"]/g
  let match

  while ((match = exportBlockPattern.exec(source)) !== null) {
    match[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const cleaned = item.replace(/\/\/.*$/u, '').trim()
        const aliasMatch = cleaned.match(/\bas\s+([A-Za-z_$][\w$]*)$/u)
        const directMatch = cleaned.match(/^([A-Za-z_$][\w$]*)$/u)

        if (aliasMatch) {
          names.push(aliasMatch[1])
          return
        }

        if (directMatch) {
          names.push(directMatch[1])
        }
      })
  }

  return uniqueSorted(names)
}

const packageJson = JSON.parse(
  readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
)

assertSameList(
  Object.keys(packageJson.exports ?? {}),
  expectedExports,
  'package.json exports',
)

Object.entries(expectedSurface).forEach(([filePath, expectedNames]) => {
  assertSameList(parseNamedExports(filePath), expectedNames, filePath)
})

const rootSurface = parseNamedExports('src/index.ts')
const coreSurface = parseNamedExports('src/core.ts')
const vueSurface = parseNamedExports('src/vue.ts')

assertSameList(
  rootSurface,
  uniqueSorted([
    ...coreSurface,
    ...vueSurface,
    ...expectedSurface['src/index.ts'],
  ]),
  'root stable API',
)

const coreVueLeaks = vueOnlyNames.filter((name) => coreSurface.includes(name))
assert(
  coreVueLeaks.length === 0,
  `src/core.ts must not export Vue API: ${formatList(coreVueLeaks)}.`,
)

const vueCoreLeaks = coreOnlyNames.filter((name) => vueSurface.includes(name))
assert(
  vueCoreLeaks.length === 0,
  `src/vue.ts must not export core-only API: ${formatList(vueCoreLeaks)}.`,
)

console.log('API surface check passed.')
