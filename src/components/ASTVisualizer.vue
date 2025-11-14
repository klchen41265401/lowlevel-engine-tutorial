<template>
  <div class="ast-visualizer">
    <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">抽象語法樹 (AST)</h3>
      </div>
      <div class="p-4 overflow-auto" style="max-height: 600px;">
        <div v-if="!ast" class="text-gray-400 text-center py-8">
          尚無 AST，請先執行語法分析
        </div>
        <div v-else class="ast-tree">
          <ASTNodeComponent
            :node="ast"
            :selected-node="selectedNode"
            :level="0"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ASTNode } from '@/types'
import ASTNodeComponent from './ASTNode.vue'

interface Props {
  ast: ASTNode | null
  selectedNode?: string | null
}

withDefaults(defineProps<Props>(), {
  selectedNode: null
})

const emit = defineEmits<{
  nodeClick: [nodeId: string]
}>()

const handleNodeClick = (nodeId: string) => {
  emit('nodeClick', nodeId)
}
</script>

<style scoped>
.ast-tree {
  font-family: 'Courier New', monospace;
}
</style>
