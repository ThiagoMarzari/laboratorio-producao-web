import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/deploy',
      name: 'deploy',
      component: () => import('../views/DeployView.vue'),
    },
    {
      path: '/docker',
      name: 'docker',
      component: () => import('../views/DockerView.vue'),
    },
    {
      path: '/relatorios',
      name: 'relatorios',
      component: () => import('../views/ReportsView.vue'),
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsersView.vue'),
    },
  ],
})

export default router
