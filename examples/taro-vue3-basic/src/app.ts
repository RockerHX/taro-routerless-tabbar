import { createApp } from 'vue'
import IndexPage from './pages/index/index.vue'

import './app.css'

if (process.env.TARO_ENV === 'h5') {
  createApp(IndexPage).mount('#app')
}

export default IndexPage
