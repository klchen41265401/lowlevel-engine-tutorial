<template>
  <div class="code-editor-wrapper">
    <div class="flex items-center justify-between mb-2">
      <label v-if="label" class="text-sm font-semibold text-gray-700">{{ label }}</label>
      <div class="flex gap-2">
        <button v-if="showRunButton" @click="$emit('run')" class="btn btn-primary btn-sm">
          ▶ 執行
        </button>
        <button v-if="showClearButton" @click="clear" class="btn btn-secondary btn-sm">
          清空
        </button>
      </div>
    </div>
    <div class="relative">
      <textarea
        ref="textarea"
        :value="modelValue"
        @input="handleInput"
        class="w-full font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :rows="rows"
        :placeholder="placeholder"
        :readonly="readonly"
        :class="{ 'bg-gray-50': readonly }"
      ></textarea>
      <div v-if="highlightLines.length > 0" class="absolute inset-0 pointer-events-none">
        <div
          v-for="line in highlightLines"
          :key="line"
          class="highlight-line"
          :style="{ top: `${(line - 1) * 1.5}rem` }"
        ></div>
      </div>
    </div>
    <div v-if="error" class="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
      ⚠ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  readonly?: boolean
  showRunButton?: boolean
  showClearButton?: boolean
  highlightLines?: number[]
  error?: string
}

withDefaults(defineProps<Props>(), {
  rows: 10,
  readonly: false,
  showRunButton: false,
  showClearButton: false,
  highlightLines: () => [],
  error: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'run': []
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.btn-sm {
  @apply px-3 py-1 text-sm;
}

.highlight-line {
  @apply bg-yellow-200 opacity-30 h-6;
}

textarea {
  resize: vertical;
  min-height: 150px;
}
</style>
