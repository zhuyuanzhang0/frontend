import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const HomeView = () => import('../views/HomeView.vue')
const LoginView = () => import('../views/LoginView.vue')
const Test1 = () => import('../views/test1.vue')
const choujiang = () => import('../views/choujiang.vue')


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/choujiang',
      name: 'choujiang',
      component: choujiang,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/doc',
      name: 'doc',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/assets',
      name: 'assets',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/setting',
      name: 'setting',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/test1',
      name: 'test1',
      component: Test1,
    },
  ],
})
// router.beforeEach((to, from, next) => {
//   const userStore = useUserStore()
//   const hasToken = !!userStore.token

//   if (to.meta?.requiresAuth && !hasToken) {
//     next('/login')
//   } else {
//     next()
//   }
// })

export default router
