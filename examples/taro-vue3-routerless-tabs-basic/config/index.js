function createAlipayBrowserslistAssetPlugin() {
  return {
    name: 'basic-alipay-browserslist-asset',
    apply: 'build',
    buildStart() {
      this.emitFile({
        type: 'asset',
        fileName: '.browserslistrc',
        source: 'defaults and fully supports es6-module',
      })
    },
  }
}

const config = {
  projectName: 'taro-routerless-tabbar-basic',
  date: '2026-06-24',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'vue3',
  compiler: {
    type: 'vite',
    vitePlugins:
      process.env.TARO_ENV === 'alipay'
        ? [createAlipayBrowserslistAssetPlugin()]
        : [],
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
  },
}

module.exports = function createTaroConfig() {
  return config
}
