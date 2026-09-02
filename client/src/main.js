import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

// ⭐ เพิ่มบรรทัดนี้
import MainHeader from './components/Header.vue'
import MainFooter from './components/Footer.vue'

import './style.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// ⭐ ลงทะเบียน Global Component
app.component('main-header', MainHeader)
app.component('main-footer', MainFooter)

app.mount('#app')
