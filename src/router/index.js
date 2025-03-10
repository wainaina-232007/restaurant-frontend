import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import TestPage from '../views/TestPage.vue'
import ContactUsView from '../views/ContactUsView.vue'
import LoginPage from '../views/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about-us',
      name: 'about',      
      component: AboutView
    },
    {
      path: '/test',
      name: 'TestPage',
      component: TestPage
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage
    },
    {
      path: '/contact-us',
      name: 'ContactUs',
      component: ContactUsView
    }
  ]
})

export default router