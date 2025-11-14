<template>
  <div class="parser-page">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">第三章：語法分析器 (Parser)</h1>

    <!-- 概念說明 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">什麼是語法分析？</h2>
      <p class="text-gray-700 mb-4">
        語法分析器（Parser）接收詞法分析器產生的 Token 流，根據文法規則構建抽象語法樹（AST）。
        AST 是源代碼結構的樹狀表示，是後續編譯階段的基礎。
      </p>
      <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <p class="font-semibold text-green-800">舉例：</p>
        <code class="block mt-2 font-mono text-sm">int result = (a + 3) * b;</code>
        <p class="mt-2 text-gray-700">會生成如下的 AST：</p>
        <pre class="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
VariableDecl
├── type: int
├── name: result
└── initializer: BinaryOp(*)
    ├── left: BinaryOp(+)
    │   ├── left: Identifier(a)
    │   └── right: Literal(3)
    └── right: Identifier(b)</pre>
      </div>
    </section>

    <!-- 互動式演示 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">互動式演示</h2>
      
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
            @run="runParser"
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

        <!-- AST 可視化 -->
        <div>
          <ASTVisualizer
            :ast="ast"
            :selected-node="selectedNodeId"
            @node-click="handleNodeClick"
          />
        </div>
      </div>

      <!-- 節點詳細資訊 -->
      <div v-if="selectedNode" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-800 mb-2">選中節點資訊</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600">類型：</span>
            <span class="font-mono font-semibold">{{ selectedNode.type }}</span>
          </div>
          <div v-if="selectedNode.value !== undefined">
            <span class="text-gray-600">值：</span>
            <span class="font-mono font-semibold">{{ selectedNode.value }}</span>
          </div>
          <div v-if="selectedNode.name">
            <span class="text-gray-600">名稱：</span>
            <span class="font-mono font-semibold">{{ selectedNode.name }}</span>
          </div>
          <div v-if="selectedNode.operator">
            <span class="text-gray-600">運算符：</span>
            <span class="font-mono font-semibold">{{ selectedNode.operator }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 節點類型說明 -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">AST 節點類型</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-green-600 mb-2">VariableDecl</h3>
          <p class="text-sm text-gray-600">變數宣告節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">int x = 10;</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-orange-600 mb-2">BinaryOp</h3>
          <p class="text-sm text-gray-600">二元運算節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">a + b</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-blue-600 mb-2">Identifier</h3>
          <p class="text-sm text-gray-600">識別符節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">myVariable</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-purple-600 mb-2">Literal</h3>
          <p class="text-sm text-gray-600">字面量節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">42, "text"</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-pink-600 mb-2">IfStatement</h3>
          <p class="text-sm text-gray-600">條件語句節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">if (x > 0) {...}</code>
        </div>
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-indigo-600 mb-2">WhileLoop</h3>
          <p class="text-sm text-gray-600">迴圈節點</p>
          <code class="text-xs bg-gray-100 p-1 rounded block mt-2">while (i < 10) {...}</code>
        </div>
      </div>
    </section>

    <!-- 導航 -->
    <div class="mt-8 flex justify-between">
      <RouterLink to="/compiler/lexer" class="btn btn-secondary">
        ← 上一章：詞法分析
      </RouterLink>
      <RouterLink to="/vm" class="btn btn-primary">
        下一章：虛擬機 →
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lexer } from '@/lib/compiler/lexer'
import { Parser } from '@/lib/compiler/parser'
import type { ASTNode } from '@/types'
import CodeEditor from '@/components/CodeEditor.vue'
import ASTVisualizer from '@/components/ASTVisualizer.vue'

const sourceCode = ref('int result = (a + 3) * b;')
const ast = ref<ASTNode | null>(null)
const selectedNodeId = ref<string | null>(null)
const error = ref('')

const examples = [
  { label: '變數宣告', code: 'int x = 10;' },
  { label: '運算式', code: 'int result = (a + 3) * b;' },
  { label: 'if 語句', code: 'if (x > 0) {\n  y = 1;\n}' },
  { label: 'while 迴圈', code: 'while (i < 10) {\n  i = i + 1;\n}' },
  { label: '多個語句', code: 'int a = 5;\nint b = 3;\nint sum = a + b;' }
]

const selectedNode = computed(() => {
  if (!ast.value || !selectedNodeId.value) return null
  return findNodeById(ast.value, selectedNodeId.value)
})

const runParser = () => {
  try {
    error.value = ''
    const lexer = new Lexer(sourceCode.value)
    const tokens = lexer.tokenize()
    const parser = new Parser(tokens)
    ast.value = parser.parse()
    selectedNodeId.value = null
  } catch (e: any) {
    error.value = e.message
    ast.value = null
  }
}

const loadExample = (code: string) => {
  sourceCode.value = code
  runParser()
}

const handleNodeClick = (nodeId: string) => {
  selectedNodeId.value = nodeId
}

const findNodeById = (node: ASTNode, id: string): ASTNode | null => {
  if (node.id === id) return node
  
  // 搜索 children
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  
  // 搜索其他子節點屬性
  const childKeys = ['left', 'right', 'operand', 'initializer', 'condition', 'thenBranch', 'elseBranch', 'body', 'expression', 'value']
  for (const key of childKeys) {
    const child = node[key]
    if (child && typeof child === 'object' && 'type' in child) {
      const found = findNodeById(child as ASTNode, id)
      if (found) return found
    }
  }
  
  return null
}

// 初始執行
runParser()
</script>
