<template>
  <div class="vm-executor">
    <div class="bg-white rounded-lg border border-gray-300 shadow-sm">
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">虛擬機執行器</h3>
      </div>
      
      <div class="p-4">
        <!-- 控制按鈕 -->
        <div class="flex gap-2 mb-4">
          <button
            @click="$emit('step')"
            :disabled="state.isFinished"
            class="btn btn-primary"
          >
            ⏭ 單步執行
          </button>
          <button
            @click="$emit('run')"
            :disabled="state.isFinished"
            class="btn btn-success"
          >
            ▶ 運行
          </button>
          <button
            @click="$emit('reset')"
            class="btn btn-secondary"
          >
            🔄 重置
          </button>
          <div class="flex-1"></div>
          <div v-if="state.isFinished" class="text-green-600 font-semibold flex items-center">
            ✓ 執行完畢
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 指令列表 -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold mb-2 text-gray-700">指令列表</h4>
            <div class="space-y-1 max-h-64 overflow-y-auto">
              <div
                v-for="(inst, index) in instructions"
                :key="index"
                class="p-2 rounded font-mono text-sm transition-all"
                :class="{
                  'bg-yellow-200 border-2 border-yellow-500 font-bold': index === state.pc,
                  'bg-gray-50': index !== state.pc
                }"
              >
                <span class="text-gray-500 mr-2">{{ index }}:</span>
                <span class="text-blue-600">{{ inst.opcode }}</span>
                <span v-if="inst.operand !== undefined" class="text-green-600 ml-2">
                  {{ inst.operand }}
                </span>
              </div>
            </div>
          </div>

          <!-- 堆疊 -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold mb-2 text-gray-700">堆疊</h4>
            <div class="space-y-1 max-h-64 overflow-y-auto">
              <div v-if="state.stack.length === 0" class="text-gray-400 text-center py-4">
                堆疊為空
              </div>
              <div
                v-for="(item, index) in reversedStack"
                :key="index"
                class="stack-item"
              >
                <div class="text-xs text-gray-500">頂 -{{ index }}</div>
                <div class="font-mono font-semibold">{{ item }}</div>
              </div>
            </div>
          </div>

          <!-- 局部變數 -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold mb-2 text-gray-700">局部變數</h4>
            <div class="max-h-64 overflow-y-auto">
              <div v-if="Object.keys(state.locals).length === 0" class="text-gray-400 text-center py-4">
                無變數
              </div>
              <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-2">名稱</th>
                    <th class="text-left p-2">值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(value, name) in state.locals" :key="name" class="border-t">
                    <td class="p-2 font-mono text-blue-600">{{ name }}</td>
                    <td class="p-2 font-mono">{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 輸出 -->
        <div v-if="state.output.length > 0" class="mt-4 border rounded-lg p-3">
          <h4 class="font-semibold mb-2 text-gray-700">輸出</h4>
          <div class="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded">
            <div v-for="(line, index) in state.output" :key="index">
              {{ line }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VMState, Instruction } from '@/types'

interface Props {
  state: VMState
  instructions: Instruction[]
}

const props = defineProps<Props>()

defineEmits<{
  step: []
  run: []
  reset: []
}>()

const reversedStack = computed(() => {
  return [...props.state.stack].reverse()
})
</script>
