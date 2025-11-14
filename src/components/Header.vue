<template>
  <header class="bg-white border-b-2 border-gray-200 shadow-sm">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <RouterLink to="/" class="hover:text-blue-600 transition">
              🚀 虛擬機與編譯器教學
            </RouterLink>
          </h1>
        </div>
        <nav class="hidden md:flex space-x-6">
          <RouterLink to="/basics" class="text-gray-700 hover:text-blue-600 transition font-medium">基礎概念</RouterLink>
          <RouterLink to="/compiler/lexer" class="text-gray-700 hover:text-blue-600 transition font-medium">詞法分析</RouterLink>
          <RouterLink to="/compiler/parser" class="text-gray-700 hover:text-blue-600 transition font-medium">語法分析</RouterLink>
          <RouterLink to="/vm" class="text-gray-700 hover:text-blue-600 transition font-medium">虛擬機</RouterLink>
          <RouterLink to="/memory" class="text-gray-700 hover:text-blue-600 transition font-medium">記憶體對照</RouterLink>
        </nav>
        <button @click="toggleMenu" class="md:hidden text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <!-- Mobile Menu -->
      <nav v-if="isMenuOpen" class="md:hidden mt-4 space-y-2 bg-gray-50 rounded-lg p-2">
        <RouterLink to="/basics" class="block py-2 hover:bg-blue-100 rounded px-2 text-gray-700 font-medium">基礎概念</RouterLink>
        <RouterLink to="/compiler/lexer" class="block py-2 hover:bg-blue-100 rounded px-2 text-gray-700 font-medium">詞法分析</RouterLink>
        <RouterLink to="/compiler/parser" class="block py-2 hover:bg-blue-100 rounded px-2 text-gray-700 font-medium">語法分析</RouterLink>
        <RouterLink to="/vm" class="block py-2 hover:bg-blue-100 rounded px-2 text-gray-700 font-medium">虛擬機</RouterLink>
        <RouterLink to="/memory" class="block py-2 hover:bg-blue-100 rounded px-2 text-gray-700 font-medium">記憶體對照</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
a.router-link-active {
  @apply text-blue-600 font-bold;
}
</style>
