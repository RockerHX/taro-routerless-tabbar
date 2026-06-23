const config = {
  projectName: 'taro-routerless-tabbar-fixture',
  date: '2026-06-23',
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
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
  },
}

module.exports = function createTaroConfig() {
  return config
}
