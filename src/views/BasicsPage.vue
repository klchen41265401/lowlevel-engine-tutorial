<template>
  <div class="basics-page">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">第一章：基礎概念</h1>

    <!-- 執行模型比較 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">三大執行模型比較</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>執行模型</th>
              <th>代表語言</th>
              <th>轉換時機</th>
              <th>執行方式</th>
              <th>跨平台性</th>
              <th>效能</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-semibold text-blue-600">編譯型</td>
              <td>C/C++, Rust</td>
              <td>編譯時</td>
              <td>直接執行機器碼</td>
              <td>需重新編譯</td>
              <td class="text-green-600 font-semibold">最高</td>
            </tr>
            <tr>
              <td class="font-semibold text-purple-600">虛擬機型</td>
              <td>Java, C#</td>
              <td>編譯+執行時</td>
              <td>在虛擬機上執行</td>
              <td class="text-green-600">高</td>
              <td class="text-yellow-600">中等</td>
            </tr>
            <tr>
              <td class="font-semibold text-orange-600">直譯型</td>
              <td>Python, JavaScript</td>
              <td>執行時</td>
              <td>逐行解釋執行</td>
              <td class="text-green-600">高</td>
              <td class="text-red-600">較低</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 編譯器架構 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">編譯器完整流程</h2>
      <div class="bg-gray-50 p-6 rounded-lg">
        <div class="space-y-4">
          <div v-for="(stage, index) in compilerStages" :key="index" class="flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ stage.name }}</h3>
              <p class="text-gray-600 text-sm">{{ stage.description }}</p>
            </div>
            <div v-if="index < compilerStages.length - 1" class="text-gray-400 text-2xl">
              ↓
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 軟體 vs 韌體對照 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">軟體引擎 vs 韌體引擎</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h3 class="font-semibold text-xl mb-3 text-blue-800">💻 軟體開發</h3>
          <ul class="space-y-2 text-gray-700">
            <li>• 執行在作業系統上</li>
            <li>• 虛擬記憶體管理</li>
            <li>• 動態連結庫</li>
            <li>• 豐富的系統 API</li>
            <li>• GC 自動記憶體管理</li>
          </ul>
        </div>
        <div class="border-2 border-green-300 rounded-lg p-4 bg-green-50">
          <h3 class="font-semibold text-xl mb-3 text-green-800">⚡ 韌體開發</h3>
          <ul class="space-y-2 text-gray-700">
            <li>• 直接運行在硬體上</li>
            <li>• 實體記憶體（Flash/SRAM）</li>
            <li>• 靜態連結</li>
            <li>• 硬體暫存器操作</li>
            <li>• 手動記憶體管理</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 實際應用 -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">實際應用場景</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div class="text-3xl mb-2">🖥️</div>
          <h3 class="font-semibold mb-2">桌面應用</h3>
          <p class="text-sm text-gray-600">使用編譯型語言（C++, Rust）開發高效能應用</p>
        </div>
        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div class="text-3xl mb-2">🌐</div>
          <h3 class="font-semibold mb-2">Web 應用</h3>
          <p class="text-sm text-gray-600">JavaScript 引擎在瀏覽器中執行</p>
        </div>
        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div class="text-3xl mb-2">🤖</div>
          <h3 class="font-semibold mb-2">嵌入式系統</h3>
          <p class="text-sm text-gray-600">韌體直接控制硬體裝置</p>
        </div>
      </div>
    </section>

    <!-- 下一步 -->
    <div class="mt-8 flex justify-end">
      <RouterLink to="/compiler/lexer" class="btn btn-primary">
        下一章：詞法分析 →
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const compilerStages = ref([
  { name: '預處理器', description: '處理 #include, #define 等預處理指令' },
  { name: '詞法分析', description: '將源代碼轉換為 Token 流' },
  { name: '語法分析', description: '構建抽象語法樹 (AST)' },
  { name: '語義分析', description: '類型檢查和符號表管理' },
  { name: '中間代碼生成', description: '生成平台無關的中間表示 (IR)' },
  { name: '優化', description: '進行各種代碼優化' },
  { name: '代碼生成', description: '生成目標平台的組合語言' },
  { name: '組譯與連結', description: '生成最終可執行檔' }
])
</script>
