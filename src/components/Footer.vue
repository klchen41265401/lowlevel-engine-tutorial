<template>
  <footer class="bg-gray-900 text-white py-8 mt-12 border-t-4 border-gray-300">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">關於本站</h3>
          <p class="text-gray-300">
            互動式學習虛擬機與編譯器底層原理，包含完整的理論與實作。
          </p>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">快速連結</h3>
          <ul class="space-y-2 text-gray-400">
            <li><RouterLink to="/basics" class="hover:text-white">基礎概念</RouterLink></li>
            <li><RouterLink to="/compiler/lexer" class="hover:text-white">編譯器</RouterLink></li>
            <li><RouterLink to="/vm" class="hover:text-white">虛擬機</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">資源</h3>
          <ul class="space-y-2 text-gray-400">
            <li><a href="#" class="hover:text-white">文檔</a></li>
            <li><a href="#" class="hover:text-white">範例代碼</a></li>
            <li><a href="#" class="hover:text-white">常見問題</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 虛擬機與編譯器教學. Made with Vue3 + TypeScript</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
