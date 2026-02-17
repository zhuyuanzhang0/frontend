import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueTippy from 'vue-tippy'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(pinia)
app.use(router)
app.use(
  VueTippy,
  // optional
  {
    directive: 'tippy', // => v-tippy
    component: 'tippy', // => <tippy/>
    componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
    defaultProps: {
      placement: 'auto-end',
      allowHTML: true,
    }, // => Global default options * see all props
  },
)

app.mount('#app')

import './assets/main.css'
