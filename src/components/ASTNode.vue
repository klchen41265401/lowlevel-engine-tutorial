<template>
  <div
    class="ast-node-item"
    :style="{ marginLeft: `${level * 20}px` }"
  >
    <div
      class="node-content p-2 rounded border-2 cursor-pointer my-1 transition-all"
      :class="{
        'bg-blue-100 border-blue-500': node.id === selectedNode,
        'bg-white border-gray-300 hover:bg-gray-50': node.id !== selectedNode
      }"
      @click.stop="$emit('nodeClick', node.id)"
    >
      <div class="flex items-center gap-2">
        <button
          v-if="hasChildren"
          @click.stop="toggleExpand"
          class="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-800"
        >
          <span v-if="isExpanded">▼</span>
          <span v-else>▶</span>
        </button>
        <div class="flex-1">
          <span class="node-type font-semibold" :class="`type-${node.type.toLowerCase()}`">
            {{ node.type }}
          </span>
          <span v-if="node.value !== undefined" class="ml-2 text-gray-600">
            = <span class="font-mono">{{ node.value }}</span>
          </span>
          <span v-if="node.name" class="ml-2 text-blue-600 font-mono">
            {{ node.name }}
          </span>
          <span v-if="node.operator" class="ml-2 text-yellow-600 font-mono">
            {{ node.operator }}
          </span>
        </div>
      </div>
    </div>

    <!-- 子節點 -->
    <div v-if="isExpanded && hasChildren" class="children">
      <ASTNodeComponent
        v-for="(child, index) in getAllChildren()"
        :key="child?.id || index"
        :node="child"
        :selected-node="selectedNode"
        :level="level + 1"
        @node-click="$emit('nodeClick', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ASTNode } from '@/types'

interface Props {
  node: ASTNode
  selectedNode?: string | null
  level: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedNode: null
})

defineEmits<{
  nodeClick: [nodeId: string]
}>()

const isExpanded = ref(true)

const hasChildren = computed(() => {
  const allChildren = getAllChildren()
  return allChildren.length > 0
})

const getAllChildren = (): ASTNode[] => {
  const children: ASTNode[] = []

  if (props.node.children && props.node.children.length > 0) {
    children.push(...props.node.children)
  }

  // 收集其他可能的子節點
  const childKeys = ['left', 'right', 'operand', 'initializer', 'condition', 'thenBranch', 'elseBranch', 'body', 'expression', 'value']

  for (const key of childKeys) {
    const child = props.node[key]
    if (child && typeof child === 'object' && 'type' in child) {
      children.push(child as ASTNode)
    }
  }

  return children
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.node-content {
  display: inline-block;
  min-width: 200px;
}

.type-program { @apply text-purple-600; }
.type-variabledecl { @apply text-green-600; }
.type-binaryop { @apply text-orange-600; }
.type-unaryop { @apply text-red-600; }
.type-literal { @apply text-blue-600; }
.type-identifier { @apply text-cyan-600; }
.type-ifstatement { @apply text-pink-600; }
.type-whileloop { @apply text-indigo-600; }
.type-returnstatement { @apply text-teal-600; }
</style>
