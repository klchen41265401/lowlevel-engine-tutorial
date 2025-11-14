import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import LexerPage from '@/views/LexerPage.vue'
import ParserPage from '@/views/ParserPage.vue'
import VMPage from '@/views/VMPage.vue'
import MemoryPage from '@/views/MemoryPage.vue'
import BasicsPage from '@/views/BasicsPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/basics',
    name: 'Basics',
    component: BasicsPage
  },
  {
    path: '/compiler/lexer',
    name: 'Lexer',
    component: LexerPage
  },
  {
    path: '/compiler/parser',
    name: 'Parser',
    component: ParserPage
  },
  {
    path: '/vm',
    name: 'VM',
    component: VMPage
  },
  {
    path: '/memory',
    name: 'Memory',
    component: MemoryPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
