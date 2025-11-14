<template>
  <div class="memory-page">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">第五章：記憶體管理對照</h1>

    <!-- 概念說明 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">軟體 vs 韌體記憶體管理</h2>
      <p class="text-gray-700 mb-4">
        軟體開發和韌體開發在記憶體管理上有顯著差異。軟體運行在作業系統之上，使用虛擬記憶體；
        而韌體直接運行在硬體上，使用實體記憶體位址。
      </p>
    </section>

    <!-- 記憶體佈局對照 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">記憶體佈局對照圖</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 軟體記憶體 -->
        <div>
          <h3 class="text-xl font-semibold mb-4 text-blue-800">💻 軟體記憶體 (x86-64)</h3>
          <div class="space-y-2">
            <div
              v-for="segment in softwareMemory"
              :key="segment.name"
              class="memory-segment"
              :style="{ 
                backgroundColor: segment.color, 
                minHeight: getSegmentHeight(segment.size)
              }"
            >
              <div class="font-semibold">{{ segment.name }}</div>
              <div class="text-sm opacity-80">{{ segment.startAddress }} - {{ segment.endAddress }}</div>
              <div class="text-xs mt-1">{{ segment.description }}</div>
            </div>
          </div>
        </div>

        <!-- 韌體記憶體 -->
        <div>
          <h3 class="text-xl font-semibold mb-4 text-green-800">⚡ 韌體記憶體 (STM32)</h3>
          <div class="space-y-2">
            <div
              v-for="segment in firmwareMemory"
              :key="segment.name"
              class="memory-segment"
              :style="{ 
                backgroundColor: segment.color,
                minHeight: getSegmentHeight(segment.size)
              }"
            >
              <div class="font-semibold">{{ segment.name }}</div>
              <div class="text-sm opacity-80">{{ segment.startAddress }} - {{ segment.endAddress }}</div>
              <div class="text-xs mt-1">{{ segment.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 詳細對照表 -->
    <section class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4">特性對照表</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>概念</th>
              <th>軟體層面</th>
              <th>韌體層面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-semibold">指令集</td>
              <td>x86/ARM 機器碼</td>
              <td>微控制器指令集 (AVR, Cortex-M)</td>
            </tr>
            <tr>
              <td class="font-semibold">記憶體管理</td>
              <td>虛擬記憶體，分頁機制</td>
              <td>實體記憶體，直接定址</td>
            </tr>
            <tr>
              <td class="font-semibold">堆疊</td>
              <td>自動擴展（通常 MB 級）</td>
              <td>固定大小（通常 KB 級）</td>
            </tr>
            <tr>
              <td class="font-semibold">堆積</td>
              <td>malloc/new 動態分配</td>
              <td>通常避免或手動管理</td>
            </tr>
            <tr>
              <td class="font-semibold">中斷處理</td>
              <td>作業系統信號/中斷</td>
              <td>硬體中斷向量表</td>
            </tr>
            <tr>
              <td class="font-semibold">啟動</td>
              <td>OS 載入器 → main()</td>
              <td>Reset_Handler → main()</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 代碼範例對照 -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">代碼範例對照</h2>
      
      <div class="space-y-6">
        <!-- 記憶體分配 -->
        <div>
          <h3 class="font-semibold text-lg mb-3">記憶體分配</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-semibold text-blue-700 mb-2">軟體 (C++)</div>
              <pre class="code-block text-sm"><code>// 動態分配記憶體
int* ptr = new int[100];

// 使用
ptr[0] = 42;

// 釋放
delete[] ptr;</code></pre>
            </div>
            <div>
              <div class="text-sm font-semibold text-green-700 mb-2">韌體 (C)</div>
              <pre class="code-block"><code>// 靜態分配或使用緩衝區
int buffer[100];

// 使用
buffer[0] = 42;

// 不需要釋放（編譯時分配）</code></pre>
            </div>
          </div>
        </div>

        <!-- 硬體存取 -->
        <div>
          <h3 class="font-semibold text-lg mb-3">硬體/周邊存取</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-semibold text-blue-700 mb-2">軟體 (C++)</div>
              <pre class="code-block"><code>// 通過作業系統 API
#include &lt;iostream&gt;
std::cout << "Hello" << std::endl;

// 或使用驅動程式
FILE* fp = fopen("/dev/gpio", "w");</code></pre>
            </div>
            <div>
              <div class="text-sm font-semibold text-green-700 mb-2">韌體 (C)</div>
              <pre class="code-block"><code>// 直接操作暫存器
#define GPIOA_BASE 0x40020000
#define GPIOA_ODR  (*(volatile uint32_t*)(GPIOA_BASE + 0x14))

// 設置 GPIO
GPIOA_ODR |= (1 << 5);  // 設置 bit 5</code></pre>
            </div>
          </div>
        </div>

        <!-- 中斷處理 -->
        <div>
          <h3 class="font-semibold text-lg mb-3">中斷處理</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-semibold text-blue-700 mb-2">軟體 (C++)</div>
              <pre class="code-block"><code>// 使用信號處理
#include &lt;signal.h&gt;

void handler(int sig) {
    // 處理中斷
}

signal(SIGINT, handler);</code></pre>
            </div>
            <div>
              <div class="text-sm font-semibold text-green-700 mb-2">韌體 (C)</div>
              <pre class="code-block"><code>// 中斷服務程式
void EXTI0_IRQHandler(void) {
    // 清除中斷旗標
    EXTI->PR |= (1 << 0);
    
    // 處理中斷
}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 導航 -->
    <div class="mt-8 flex justify-between">
      <RouterLink to="/vm" class="btn btn-secondary">
        ← 上一章：虛擬機
      </RouterLink>
      <RouterLink to="/" class="btn btn-primary">
        回到首頁
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MemorySegment } from '@/types'

const softwareMemory: MemorySegment[] = [
  { name: 'Kernel Space', startAddress: '0xC0000000', endAddress: '0xFFFFFFFF', size: '1GB', color: '#fee2e2', type: 'reserved', description: '核心空間' },
  { name: 'Stack ↓', startAddress: '0xBFFFFFFF', endAddress: '0xB0000000', size: '~256MB', color: '#dbeafe', type: 'stack', description: '函式呼叫堆疊' },
  { name: 'Memory Map', startAddress: '0xAFFFFFFF', endAddress: '0xA0000000', size: '~256MB', color: '#e0e7ff', type: 'data', description: '記憶體映射區' },
  { name: 'Heap ↑', startAddress: '0x9FFFFFFF', endAddress: '0x60000000', size: '~1GB', color: '#dcfce7', type: 'heap', description: '動態分配區' },
  { name: 'BSS', startAddress: '0x5FFFFFFF', endAddress: '0x50000000', size: '~256MB', color: '#fef3c7', type: 'data', description: '未初始化資料' },
  { name: 'Data', startAddress: '0x4FFFFFFF', endAddress: '0x40000000', size: '~256MB', color: '#fde68a', type: 'data', description: '已初始化資料' },
  { name: 'Text (Code)', startAddress: '0x3FFFFFFF', endAddress: '0x08000000', size: '~896MB', color: '#bfdbfe', type: 'code', description: '程式碼段' },
  { name: 'Reserved', startAddress: '0x07FFFFFF', endAddress: '0x00000000', size: '~128MB', color: '#f3f4f6', type: 'reserved', description: '保留區域' }
]

const firmwareMemory: MemorySegment[] = [
  { name: 'External Devices', startAddress: '0x60000000', endAddress: '0xFFFFFFFF', size: '~2.5GB', color: '#f3f4f6', type: 'peripheral', description: '外部裝置' },
  { name: 'Peripherals', startAddress: '0x40000000', endAddress: '0x5FFFFFFF', size: '512MB', color: '#fce7f3', type: 'peripheral', description: 'GPIO, UART, Timer 等' },
  { name: 'SRAM', startAddress: '0x20000000', endAddress: '0x3FFFFFFF', size: '512MB', color: '#dcfce7', type: 'data', description: '變數、堆疊、堆積' },
  { name: 'Flash', startAddress: '0x08000000', endAddress: '0x1FFFFFFF', size: '384MB', color: '#bfdbfe', type: 'code', description: '程式碼、常數、中斷向量表' }
]

const getSegmentHeight = (size: string): string => {
  // 根據大小計算視覺高度
  const sizeNum = parseInt(size)
  if (sizeNum >= 1000) return '120px'
  if (sizeNum >= 500) return '100px'
  if (sizeNum >= 256) return '80px'
  return '60px'
}
</script>
