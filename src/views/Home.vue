<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 py-20 rounded-lg shadow-lg mb-12">
      <div class="text-center">
        <h1 class="text-5xl font-bold mb-4 text-gray-900">虛擬機與編譯器底層引擎</h1>
        <p class="text-xl mb-8 text-gray-700">互動式學習平台 - 從基礎到精通</p>
        <div class="flex justify-center gap-4">
          <RouterLink to="/basics" class="btn btn-primary">
            開始學習
          </RouterLink>
          <RouterLink to="/compiler/lexer" class="btn btn-secondary">
            動手實作
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 特色功能 -->
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">學習特色</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card hover:shadow-xl transition-shadow">
          <div class="text-4xl mb-4">🎯</div>
          <h3 class="text-xl font-semibold mb-2">互動式學習</h3>
          <p class="text-gray-600">
            實時編寫代碼，立即看到編譯和執行結果，深入理解每個步驟。
          </p>
        </div>
        <div class="card hover:shadow-xl transition-shadow">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">可視化展示</h3>
          <p class="text-gray-600">
            Token 流、AST、虛擬機狀態全部可視化，複雜概念一目了然。
          </p>
        </div>
        <div class="card hover:shadow-xl transition-shadow">
          <div class="text-4xl mb-4">⚡</div>
          <h3 class="text-xl font-semibold mb-2">完整架構</h3>
          <p class="text-gray-600">
            涵蓋編譯器前端、後端、優化技術、虛擬機原理和實作。
          </p>
        </div>
      </div>
    </section>

    <!-- 學習路徑 -->
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">學習路徑</h2>
      <div class="space-y-4">
        <RouterLink to="/basics" class="block card hover:shadow-xl transition-all hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
              1
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold">第一章：基礎概念</h3>
              <p class="text-gray-600">了解執行模型、編譯器架構、軟體與韌體對照</p>
            </div>
            <div class="text-blue-600">→</div>
          </div>
        </RouterLink>

        <RouterLink to="/compiler/lexer" class="block card hover:shadow-xl transition-all hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
              2
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold">第二章：詞法分析</h3>
              <p class="text-gray-600">學習 Lexer 如何將源代碼轉換為 Token 流</p>
            </div>
            <div class="text-blue-600">→</div>
          </div>
        </RouterLink>

        <RouterLink to="/compiler/parser" class="block card hover:shadow-xl transition-all hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xl">
              3
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold">第三章：語法分析</h3>
              <p class="text-gray-600">學習 Parser 如何構建抽象語法樹 (AST)</p>
            </div>
            <div class="text-blue-600">→</div>
          </div>
        </RouterLink>

        <RouterLink to="/vm" class="block card hover:shadow-xl transition-all hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
              4
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold">第四章：虛擬機</h3>
              <p class="text-gray-600">深入理解虛擬機架構和指令執行過程</p>
            </div>
            <div class="text-blue-600">→</div>
          </div>
        </RouterLink>

        <RouterLink to="/memory" class="block card hover:shadow-xl transition-all hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
              5
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold">第五章:記憶體管理</h3>
              <p class="text-gray-600">學習軟體與韌體的記憶體佈局和管理差異</p>
            </div>
            <div class="text-blue-600">→</div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- 快速範例 -->
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">快速體驗</h2>
      <div class="card bg-gradient-to-br from-gray-50 to-blue-50">
        <h3 class="text-xl font-semibold mb-4">試試看：簡單的算術運算</h3>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono mb-4">
          <div>int result = (5 + 3) * 2;</div>
        </div>
        <p class="text-gray-600 mb-4">
          這段代碼會經過詞法分析、語法分析，最後在虛擬機上執行。點擊下方按鈕開始探索！
        </p>
        <RouterLink to="/compiler/lexer" class="btn btn-primary">
          開始分析 →
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
