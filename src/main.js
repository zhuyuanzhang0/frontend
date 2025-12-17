import Vue from 'vue'
import App from './App.vue'
import router from './router'
import appendToBody from '@/directives/appendToBody';

Vue.directive('append-to-body', appendToBody);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
