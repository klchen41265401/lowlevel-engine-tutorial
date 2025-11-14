<template>
  <div class="lexer-page">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">第二章：詞法分析器 (Lexer)</h1>

    <!-- 概念說明 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">什麼是詞法分析？</h2>
      <p class="text-gray-700 mb-4">
        詞法分析器（Lexer）是編譯器的第一個階段，它將源代碼字串分解為有意義的最小單位，稱為 Token。
        每個 Token 代表一個語法單元，如關鍵字、識別符、運算符等。
      </p>
      
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <p class="font-semibold text-blue-900 text-lg mb-3">📝 實際範例</p>
        <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
          <p class="text-sm text-gray-600 mb-2">源代碼：</p>
          <code class="block font-mono text-base text-gray-900 font-semibold">int x = 10 + 20;</code>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600 mb-3">分解後的 Token 序列 ↓</p>
          <div class="flex flex-wrap gap-2">
            <div class="token-example bg-purple-100 border-2 border-purple-300">
              <div class="token-type">KEYWORD</div>
              <div class="token-value">int</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-blue-100 border-2 border-blue-300">
              <div class="token-type">IDENTIFIER</div>
              <div class="token-value">x</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-yellow-100 border-2 border-yellow-300">
              <div class="token-type">OPERATOR</div>
              <div class="token-value">=</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-green-100 border-2 border-green-300">
              <div class="token-type">LITERAL</div>
              <div class="token-value">10</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-yellow-100 border-2 border-yellow-300">
              <div class="token-type">OPERATOR</div>
              <div class="token-value">+</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-green-100 border-2 border-green-300">
              <div class="token-type">LITERAL</div>
              <div class="token-value">20</div>
            </div>
            <span class="text-2xl text-gray-400">→</span>
            <div class="token-example bg-gray-100 border-2 border-gray-300">
              <div class="token-type">SEPARATOR</div>
              <div class="token-value">;</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 互動式演示 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">🎮 互動式演示</h2>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-700">
          <strong>💡 使用說明：</strong>
          <br>1. 在左側輸入或選擇範例代碼
          <br>2. 點擊「▶ 執行」按鈕進行詞法分析
          <br>3. 右側會顯示分析出的所有 Token
          <br>4. 點擊任意 Token 可以查看詳細資訊
          <br>5. 下方會顯示各類型 Token 的統計數量
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 代碼編輯器 -->
        <div>
          <CodeEditor
            v-model="sourceCode"
            label="源代碼"
            :rows="12"
            :show-run-button="true"
            :show-clear-button="true"
            :error="error"
            @run="runLexer"
          />
          
          <!-- 範例按鈕 -->
          <div class="mt-4">
            <p class="text-sm font-semibold text-gray-700 mb-2">快速範例：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(example, index) in examples"
                :key="index"
                @click="loadExample(example.code)"
                class="btn btn-secondary btn-sm"
              >
                {{ example.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Token 列表 -->
        <div>
          <TokenList
            :tokens="tokens"
            :current-index="currentTokenIndex"
            @token-click="handleTokenClick"
          />
        </div>
      </div>

      <!-- 統計資訊 -->
      <div v-if="tokens.length > 0" class="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ tokenStats.keywords }}</div>
          <div class="text-sm text-gray-600">關鍵字</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ tokenStats.identifiers }}</div>
          <div class="text-sm text-gray-600">識別符</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-green-600">{{ tokenStats.literals }}</div>
          <div class="text-sm text-gray-600">字面量</div>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ tokenStats.operators }}</div>
          <div class="text-sm text-gray-600">運算符</div>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-600">{{ tokenStats.separators }}</div>
          <div class="text-sm text-gray-600">分隔符</div>
        </div>
      </div>
    </section>

    <!-- Token 類型說明 -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">Token 類型說明</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-purple-600 mb-2">🔑 關鍵字 (KEYWORD)</h3>
          <p class="text-sm text-gray-600 mb-2">程式語言保留的特殊字詞</p>
          <code class="text-xs bg-gray-100 p-1 rounded">int, if, while, return, class</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-blue-600 mb-2">📛 識別符 (IDENTIFIER)</h3>
          <p class="text-sm text-gray-600 mb-2">變數名、函式名等</p>
          <code class="text-xs bg-gray-100 p-1 rounded">myVariable, calculateSum, User</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-green-600 mb-2">💎 字面量 (LITERAL)</h3>
          <p class="text-sm text-gray-600 mb-2">常數值</p>
          <code class="text-xs bg-gray-100 p-1 rounded">42, 3.14, "hello", true</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-yellow-600 mb-2">➕ 運算符 (OPERATOR)</h3>
          <p class="text-sm text-gray-600 mb-2">進行運算的符號</p>
          <code class="text-xs bg-gray-100 p-1 rounded">+, -, *, /, ==, !=, &&</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-gray-600 mb-2">🔹 分隔符 (SEPARATOR)</h3>
          <p class="text-sm text-gray-600 mb-2">語法結構符號</p>
          <code class="text-xs bg-gray-100 p-1 rounded">{{ '{' }}, {{ '}' }}, (, ), ;, ,</code>
        </div>
      </div>
    </section>

    <!-- 導航 -->
    <div class="mt-8 flex justify-between">
      <RouterLink to="/basics" class="btn btn-secondary">
        ← 上一章：基礎概念
      </RouterLink>
      <RouterLink to="/compiler/parser" class="btn btn-primary">
        下一章：語法分析 →
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lexer } from '@/lib/compiler/lexer'
import { TokenType, type Token } from '@/types'
import CodeEditor from '@/components/CodeEditor.vue'
import TokenList from '@/components/TokenList.vue'

const sourceCode = ref('int x = 10 + 20;')
const tokens = ref<Token[]>([])
const currentTokenIndex = ref(-1)
const error = ref('')

const examples = [
  { label: '簡單運算', code: 'int x = 10 + 20;' },
  { label: 'if 語句', code: 'if (x > 0) {\n  y = 1;\n}' },
  { label: '函式定義', code: 'int add(int a, int b) {\n  return a + b;\n}' },
  { label: '變數宣告', code: 'int count = 0;\ndouble pi = 3.14;\nstring name = "Alice";' },
  { label: 'while 迴圈', code: 'while (i < 10) {\n  i = i + 1;\n}' }
]

const tokenStats = computed(() => {
  return {
    keywords: tokens.value.filter((t: Token) => t.type === TokenType.KEYWORD).length,
    identifiers: tokens.value.filter((t: Token) => t.type === TokenType.IDENTIFIER).length,
    literals: tokens.value.filter((t: Token) => t.type === TokenType.LITERAL).length,
    operators: tokens.value.filter((t: Token) => t.type === TokenType.OPERATOR).length,
    separators: tokens.value.filter((t: Token) => t.type === TokenType.SEPARATOR).length
  }
})

const runLexer = () => {
  try {
    error.value = ''
    const lexer = new Lexer(sourceCode.value)
    tokens.value = lexer.tokenize()
    currentTokenIndex.value = 0
  } catch (e: any) {
    error.value = e.message
    tokens.value = []
  }
}

const loadExample = (code: string) => {
  sourceCode.value = code
  runLexer()
}

const handleTokenClick = (_token: Token, index: number) => {
  currentTokenIndex.value = index
}

// 初始執行
runLexer()
</script>

<style scoped>
.token-example {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  min-width: 70px;
  transition: all 0.2s;
}

.token-example:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.token-type {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  opacity: 0.7;
}

.token-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
}
</style>

