<template>
  <div class="vm-page">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">第四章：虛擬機 (Virtual Machine)</h1>

    <!-- 概念說明 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">什麼是虛擬機？</h2>
      <p class="text-gray-700 mb-4">
        虛擬機是一個軟體實現的執行環境，它模擬真實的計算機硬體。程式被編譯成虛擬機能理解的字節碼（Bytecode），
        然後由虛擬機逐條執行這些指令。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-800 mb-2">📚 堆疊 (Stack)</h3>
          <p class="text-sm text-gray-600">存儲臨時數據和計算結果</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 class="font-semibold text-green-800 mb-2">💾 局部變數</h3>
          <p class="text-sm text-gray-600">存儲變數值</p>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 class="font-semibold text-purple-800 mb-2">🎯 程式計數器 (PC)</h3>
          <p class="text-sm text-gray-600">指向當前執行的指令</p>
        </div>
      </div>
    </section>

    <!-- 互動式演示 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">互動式演示</h2>
      
      <div class="space-y-6">
        <!-- 代碼輸入 -->
        <div>
          <CodeEditor
            v-model="sourceCode"
            label="源代碼（會自動編譯成虛擬機指令）"
            :rows="8"
            :show-run-button="true"
            :show-clear-button="true"
            :error="error"
            @run="compileAndRun"
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

        <!-- 虛擬機執行器 -->
        <VMExecutor
          v-if="instructions.length > 0"
          :state="vmState"
          :instructions="instructions"
          @step="stepVM"
          @run="runVM"
          @reset="resetVM"
        />
      </div>
    </section>

    <!-- 指令集說明 -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">虛擬機指令集</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-blue-600">PUSH value</code>
          <p class="text-sm text-gray-600 mt-1">將值推入堆疊</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-blue-600">POP</code>
          <p class="text-sm text-gray-600 mt-1">彈出堆疊頂端值</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-green-600">LOAD var</code>
          <p class="text-sm text-gray-600 mt-1">載入變數到堆疊</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-green-600">STORE var</code>
          <p class="text-sm text-gray-600 mt-1">存儲堆疊頂值到變數</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-orange-600">ADD</code>
          <p class="text-sm text-gray-600 mt-1">堆疊頂兩個值相加</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-orange-600">SUB</code>
          <p class="text-sm text-gray-600 mt-1">堆疊頂兩個值相減</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-orange-600">MUL</code>
          <p class="text-sm text-gray-600 mt-1">堆疊頂兩個值相乘</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-orange-600">DIV</code>
          <p class="text-sm text-gray-600 mt-1">堆疊頂兩個值相除</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-purple-600">JMP addr</code>
          <p class="text-sm text-gray-600 mt-1">跳轉到指定位址</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-purple-600">JZ addr</code>
          <p class="text-sm text-gray-600 mt-1">條件跳轉（為零時）</p>
        </div>
        <div class="border rounded-lg p-3">
          <code class="font-semibold text-red-600">HALT</code>
          <p class="text-sm text-gray-600 mt-1">停止執行</p>
        </div>
      </div>
    </section>

    <!-- 導航 -->
    <div class="mt-8 flex justify-between">
      <RouterLink to="/compiler/parser" class="btn btn-secondary">
        ← 上一章：語法分析
      </RouterLink>
      <RouterLink to="/memory" class="btn btn-primary">
        下一章：記憶體管理 →
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Lexer } from '@/lib/compiler/lexer'
import { Parser } from '@/lib/compiler/parser'
import { VirtualMachine, compileToVM } from '@/lib/vm/virtual-machine'
import type { Instruction, VMState } from '@/types'
import CodeEditor from '@/components/CodeEditor.vue'
import VMExecutor from '@/components/VMExecutor.vue'

const sourceCode = ref('int x = 10;\nint y = 20;\nint sum = x + y;')
const instructions = ref<Instruction[]>([])
const vm = ref(new VirtualMachine())
const vmState = ref<VMState>(vm.value.getState())
const error = ref('')

const examples = [
  { label: '簡單運算', code: 'int x = 10;\nint y = 20;\nint sum = x + y;' },
  { label: '複雜表達式', code: 'int result = (5 + 3) * 2 - 4;' },
  { label: '多個變數', code: 'int a = 5;\nint b = 10;\nint c = 15;\nint total = a + b + c;' }
]

const compileAndRun = () => {
  try {
    error.value = ''
    
    // 編譯源代碼到 AST
    const lexer = new Lexer(sourceCode.value)
    const tokens = lexer.tokenize()
    const parser = new Parser(tokens)
    const ast = parser.parse()
    
    // 編譯 AST 到虛擬機指令
    instructions.value = compileToVM(ast)
    
    // 載入並執行
    vm.value.load(instructions.value)
    vmState.value = vm.value.getState()
  } catch (e: any) {
    error.value = e.message
    instructions.value = []
  }
}

const stepVM = () => {
  if (vm.value.step()) {
    vmState.value = vm.value.getState()
  }
}

const runVM = () => {
  vm.value.run()
  vmState.value = vm.value.getState()
}

const resetVM = () => {
  vm.value.reset()
  vmState.value = vm.value.getState()
}

const loadExample = (code: string) => {
  sourceCode.value = code
  compileAndRun()
}

// 初始編譯
compileAndRun()
</script>
