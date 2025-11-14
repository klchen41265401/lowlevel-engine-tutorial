<template>
  <div class="token-list-wrapper">
    <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">Token 流 ({{ tokens.length }} 個)</h3>
      </div>
      <div class="max-h-96 overflow-y-auto p-4">
        <div v-if="tokens.length === 0" class="text-gray-400 text-center py-8">
          尚無 Token，請先執行詞法分析
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(token, index) in tokens"
            :key="index"
            class="token-item p-3 rounded-lg border-2 cursor-pointer transition-all"
            :class="{
              'bg-blue-50 border-blue-500 shadow-md': index === currentIndex,
              'bg-white border-gray-200 hover:border-gray-300': index !== currentIndex,
              [`token-${token.type.toLowerCase()}`]: true
            }"
            @click="$emit('tokenClick', token, index)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="token-type-badge" :class="`badge-${token.type.toLowerCase()}`">
                    {{ token.type }}
                  </span>
                  <span class="font-mono font-semibold">{{ token.value }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  行 {{ token.line }}, 列 {{ token.column }}
                  <span class="ml-2">範圍: {{ token.span.start }}-{{ token.span.end }}</span>
                </div>
              </div>
              <div v-if="index === currentIndex" class="text-blue-600">
                ➤
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Token } from '@/types'

interface Props {
  tokens: Token[]
  currentIndex?: number
}

withDefaults(defineProps<Props>(), {
  currentIndex: -1
})

defineEmits<{
  tokenClick: [token: Token, index: number]
}>()
</script>

<style scoped>
.token-type-badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.badge-keyword {
  @apply bg-purple-100 text-purple-700;
}

.badge-identifier {
  @apply bg-blue-100 text-blue-700;
}

.badge-literal {
  @apply bg-green-100 text-green-700;
}

.badge-operator {
  @apply bg-yellow-100 text-yellow-700;
}

.badge-separator {
  @apply bg-gray-100 text-gray-700;
}

.badge-comment {
  @apply bg-gray-100 text-gray-500;
}
</style>
