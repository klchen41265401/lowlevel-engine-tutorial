# 虛擬機與編譯器底層引擎完整教學架構 - 第二部分

## 編譯器後端、優化技術與虛擬機

---

## 第四部分：中間表示與優化

### 4.1 中間表示 (Intermediate Representation, IR)

**為什麼需要 IR？**

1. 分離前端和後端，便於支援多種源語言和目標平台
2. 便於進行平台無關的優化
3. 簡化編譯器設計

**常見 IR 形式**

**1. 三地址碼 (Three-Address Code)**

每條指令最多三個運算元：

```
// 源代碼
result = (a + b) * (c - d);

// 三地址碼
t1 = a + b
t2 = c - d
t3 = t1 * t2
result = t3
```

**2. 靜態單賦值 (SSA, Static Single Assignment)**

每個變數只被賦值一次：

```
// 源代碼
if (condition) {
    x = 1;
} else {
    x = 2;
}
y = x + 3;

// SSA 形式
if (condition) {
    x1 = 1;
} else {
    x2 = 2;
}
x3 = φ(x1, x2)  // φ 函式根據執行路徑選擇
y = x3 + 3;
```

**3. LLVM IR**

```llvm
; 函式: int add(int a, int b) { return a + b; }

define i32 @add(i32 %a, i32 %b) {
entry:
  %result = add i32 %a, %b
  ret i32 %result
}

; 更複雜的例子: int max(int a, int b)
define i32 @max(i32 %a, i32 %b) {
entry:
  %cmp = icmp sgt i32 %a, %b    ; a > b ?
  br i1 %cmp, label %if.then, label %if.else

if.then:
  ret i32 %a

if.else:
  ret i32 %b
}
```

**IR 生成器實作**

```typescript
class IRGenerator {
    private instructions: IRInstruction[] = [];
    private tempCounter: number = 0;
    private labelCounter: number = 0;
    
    generate(ast: ASTNode): IRInstruction[] {
        this.visit(ast);
        return this.instructions;
    }
    
    private visit(node: ASTNode): string {
        switch (node.type) {
            case 'BinaryOp':
                return this.visitBinaryOp(node);
            case 'Identifier':
                return node.name;
            case 'Literal':
                return node.value;
            // ... 其他節點類型
        }
    }
    
    private visitBinaryOp(node: ASTNode): string {
        const left = this.visit(node.left);
        const right = this.visit(node.right);
        const temp = this.newTemp();
        
        this.emit({
            op: this.opToIR(node.operator),
            dest: temp,
            src1: left,
            src2: right
        });
        
        return temp;
    }
    
    private visitIfStatement(node: ASTNode): void {
        const condition = this.visit(node.condition);
        const elseLabel = this.newLabel();
        const endLabel = this.newLabel();
        
        // 條件為假，跳到 else
        this.emit({
            op: 'BRZ',  // Branch if Zero
            dest: elseLabel,
            src1: condition
        });
        
        // then 分支
        this.visit(node.thenBranch);
        this.emit({ op: 'JMP', dest: endLabel });
        
        // else 分支
        this.emit({ op: 'LABEL', dest: elseLabel });
        if (node.elseBranch) {
            this.visit(node.elseBranch);
        }
        
        // 結束
        this.emit({ op: 'LABEL', dest: endLabel });
    }
    
    private newTemp(): string {
        return `t${this.tempCounter++}`;
    }
    
    private newLabel(): string {
        return `L${this.labelCounter++}`;
    }
    
    private emit(instruction: IRInstruction) {
        this.instructions.push(instruction);
    }
}
```

### 4.2 優化技術

**優化層級**

| 層級 | 說明 | 範例技術 |
|-----|------|---------|
| 窺孔優化 | 檢查小段代碼模式 | 強度削減、常數折疊 |
| 局部優化 | 基本塊內優化 | 公共子表達式消除 |
| 全域優化 | 函式內優化 | 死代碼消除、循環優化 |
| 過程間優化 | 跨函式優化 | 內聯、常數傳播 |

**1. 常數折疊 (Constant Folding)**

編譯期計算常數表達式：

```cpp
// 優化前
int x = 2 + 3;
int y = x * 10 + 5;

// 優化後
int x = 5;
int y = 55;
```

實作：
```typescript
function constantFold(node: ASTNode): ASTNode {
    if (node.type === 'BinaryOp') {
        const left = constantFold(node.left);
        const right = constantFold(node.right);
        
        // 如果兩個運算元都是常數
        if (left.type === 'Literal' && right.type === 'Literal') {
            const leftVal = parseInt(left.value);
            const rightVal = parseInt(right.value);
            let result: number;
            
            switch (node.operator) {
                case '+': result = leftVal + rightVal; break;
                case '-': result = leftVal - rightVal; break;
                case '*': result = leftVal * rightVal; break;
                case '/': result = Math.floor(leftVal / rightVal); break;
            }
            
            return { type: 'Literal', value: result.toString() };
        }
        
        return { ...node, left, right };
    }
    
    return node;
}
```

**2. 死代碼消除 (Dead Code Elimination)**

移除永遠不會執行或結果不被使用的代碼：

```cpp
// 優化前
int unused = 5;
int x = 10;
if (false) {
    x = 20;  // 永遠不執行
}
return x;

// 優化後
int x = 10;
return x;
```

實作（使用活性分析）：
```typescript
class DeadCodeEliminator {
    eliminate(instructions: IRInstruction[]): IRInstruction[] {
        const liveVars = this.liveVariableAnalysis(instructions);
        const result: IRInstruction[] = [];
        
        for (let i = 0; i < instructions.length; i++) {
            const inst = instructions[i];
            
            // 如果指令定義的變數是活躍的，保留指令
            if (this.hasOutput(inst)) {
                const output = this.getOutput(inst);
                if (liveVars[i].has(output)) {
                    result.push(inst);
                }
            } else {
                // 沒有輸出的指令（如跳轉）總是保留
                result.push(inst);
            }
        }
        
        return result;
    }
    
    private liveVariableAnalysis(instructions: IRInstruction[]): Set<string>[] {
        const n = instructions.length;
        const liveVars: Set<string>[] = Array(n).fill(null).map(() => new Set());
        
        // 從後向前分析
        let changed = true;
        while (changed) {
            changed = false;
            
            for (let i = n - 1; i >= 0; i--) {
                const inst = instructions[i];
                const oldSize = liveVars[i].size;
                
                // OUT[i] = ∪ IN[successors]
                if (i < n - 1) {
                    for (const v of liveVars[i + 1]) {
                        liveVars[i].add(v);
                    }
                }
                
                // IN[i] = (OUT[i] - DEF[i]) ∪ USE[i]
                const def = this.getOutput(inst);
                if (def) {
                    liveVars[i].delete(def);
                }
                
                for (const use of this.getInputs(inst)) {
                    liveVars[i].add(use);
                }
                
                if (liveVars[i].size !== oldSize) {
                    changed = true;
                }
            }
        }
        
        return liveVars;
    }
}
```

**3. 公共子表達式消除 (CSE)**

避免重複計算相同的表達式：

```cpp
// 優化前
int a = b * c + d;
int e = b * c + f;

// 優化後
int temp = b * c;
int a = temp + d;
int e = temp + f;
```

**4. 循環優化**

**(a) 循環不變代碼外提**

```cpp
// 優化前
for (int i = 0; i < n; i++) {
    int temp = x * y;  // x 和 y 在循環中不變
    array[i] = temp + i;
}

// 優化後
int temp = x * y;
for (int i = 0; i < n; i++) {
    array[i] = temp + i;
}
```

**(b) 循環展開**

```cpp
// 優化前
for (int i = 0; i < 100; i++) {
    sum += array[i];
}

// 優化後（展開因子 4）
int i = 0;
for (; i < 96; i += 4) {
    sum += array[i];
    sum += array[i+1];
    sum += array[i+2];
    sum += array[i+3];
}
for (; i < 100; i++) {
    sum += array[i];
}
```

**(c) 循環向量化**

利用 SIMD 指令並行處理：

```cpp
// 優化前
for (int i = 0; i < n; i++) {
    c[i] = a[i] + b[i];
}

// 優化後（偽代碼，使用 SIMD）
for (int i = 0; i < n; i += 4) {
    vec4 va = load_vec4(&a[i]);
    vec4 vb = load_vec4(&b[i]);
    vec4 vc = add_vec4(va, vb);
    store_vec4(&c[i], vc);
}
```

**5. 內聯展開 (Function Inlining)**

```cpp
// 優化前
inline int square(int x) {
    return x * x;
}

int main() {
    int a = square(5);
    int b = square(7);
}

// 優化後
int main() {
    int a = 5 * 5;
    int b = 7 * 7;
}
```

**6. 尾調用優化 (Tail Call Optimization)**

將尾遞迴轉換為循環：

```cpp
// 優化前
int factorial(int n, int acc = 1) {
    if (n == 0) return acc;
    return factorial(n - 1, n * acc);  // 尾調用
}

// 優化後
int factorial(int n, int acc = 1) {
    while (n != 0) {
        acc = n * acc;
        n = n - 1;
    }
    return acc;
}
```

**互動式展示建議**
```
實作要點：
1. 輸入代碼，顯示優化前後的 IR 對比
2. 可視化優化過程的每一步
3. 提供優化效能提升的估算
4. 允許開關不同的優化選項
5. 顯示優化的權衡（代碼大小 vs 執行速度）
```

---

## 第五部分：代碼生成與連結

### 5.1 代碼生成

**指令選擇**

將 IR 映射到目標平台的機器指令：

```
IR: t1 = a + b

x86-64:
  mov eax, [a]
  add eax, [b]
  mov [t1], eax

ARM:
  ldr r0, [a]
  ldr r1, [b]
  add r2, r0, r1
  str r2, [t1]
```

**暫存器分配**

**圖著色演算法**

```typescript
class RegisterAllocator {
    private numRegisters: number = 8;  // 假設有 8 個暫存器
    
    allocate(instructions: IRInstruction[]): Map<string, string> {
        // 1. 活性分析
        const liveness = this.livenessAnalysis(instructions);
        
        // 2. 建立干擾圖
        const interferenceGraph = this.buildInterferenceGraph(liveness);
        
        // 3. 圖著色
        const coloring = this.colorGraph(interferenceGraph);
        
        // 4. 分配暫存器
        const allocation = new Map<string, string>();
        for (const [variable, color] of coloring) {
            if (color < this.numRegisters) {
                allocation.set(variable, `r${color}`);
            } else {
                // Spill 到記憶體
                allocation.set(variable, `[stack_offset_${color}]`);
            }
        }
        
        return allocation;
    }
    
    private buildInterferenceGraph(liveness: LivenessInfo): Graph {
        const graph = new Graph();
        
        for (let i = 0; i < liveness.length; i++) {
            const live = Array.from(liveness[i]);
            
            // 同時活躍的變數之間連邊
            for (let j = 0; j < live.length; j++) {
                for (let k = j + 1; k < live.length; k++) {
                    graph.addEdge(live[j], live[k]);
                }
            }
        }
        
        return graph;
    }
    
    private colorGraph(graph: Graph): Map<string, number> {
        const coloring = new Map<string, number>();
        const nodes = Array.from(graph.nodes);
        
        // 簡化版的貪婪著色算法
        for (const node of nodes) {
            const usedColors = new Set<number>();
            
            // 檢查相鄰節點的顏色
            for (const neighbor of graph.neighbors(node)) {
                if (coloring.has(neighbor)) {
                    usedColors.add(coloring.get(neighbor)!);
                }
            }
            
            // 分配第一個可用的顏色
            let color = 0;
            while (usedColors.has(color)) {
                color++;
            }
            
            coloring.set(node, color);
        }
        
        return coloring;
    }
}
```

**指令排程**

重排指令以利用 CPU 流水線：

```
// 原始順序
load r1, [a]    ; 3 個週期
add r2, r1, r3  ; 依賴 r1，需要等待
mul r4, r5, r6  ; 獨立運算

// 排程後
load r1, [a]    ; 3 個週期
mul r4, r5, r6  ; 在等待 load 完成時執行
add r2, r1, r3  ; 此時 r1 已載入
```

### 5.2 組合語言生成

**x86-64 範例**

```nasm
; int add(int a, int b) { return a + b; }
; 參數: a 在 edi, b 在 esi

add:
    push rbp
    mov rbp, rsp
    
    mov eax, edi     ; eax = a
    add eax, esi     ; eax += b
    
    pop rbp
    ret
```

**ARM 範例**

```asm
; int add(int a, int b) { return a + b; }
; 參數: a 在 r0, b 在 r1

add:
    push {r11, lr}
    mov r11, sp
    
    add r0, r0, r1   ; r0 = r0 + r1
    
    pop {r11, pc}
```

### 5.3 連結過程

**連結器的任務**

1. **符號解析**
2. **重定位**
3. **生成可執行檔**

**符號解析範例**

```cpp
// file1.cpp
extern int globalVar;

void foo() {
    globalVar = 42;
}

// file2.cpp
int globalVar;

int main() {
    foo();
    return globalVar;
}
```

連結器將 `file1.cpp` 中的 `globalVar` 參照連結到 `file2.cpp` 中的定義。

**重定位**

```
目標檔案中的相對位址：
call <PLACEHOLDER>  ; 呼叫 foo

連結後的絕對位址：
call 0x401234       ; foo 的實際位址
```

---

## 第六部分：虛擬機深度剖析

### 6.1 虛擬機架構

**JVM 架構**

```
┌─────────────────────────────────┐
│         Java 程式 (.java)        │
└───────────────┬─────────────────┘
                │ javac
                ▼
┌─────────────────────────────────┐
│      位元碼 (.class)             │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│           JVM                   │
│  ┌───────────────────────────┐  │
│  │   類別載入器               │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   執行引擎                 │  │
│  │  - 直譯器                  │  │
│  │  - JIT 編譯器              │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   記憶體管理               │  │
│  │  - 堆疊 (Heap)             │  │
│  │  - 方法區                  │  │
│  │  - JVM Stack              │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   垃圾回收器               │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 位元碼執行

**堆疊式虛擬機範例**

```java
// Java 源碼
public int add(int a, int b) {
    return a + b;
}

// 位元碼
public int add(int, int);
  Code:
    0: iload_1    // 載入參數 a
    1: iload_2    // 載入參數 b
    2: iadd       // 相加
    3: ireturn    // 返回
```

執行過程：
```
初始: Stack=[], Locals=[a=5, b=3]
iload_1: Stack=[5], Locals=[a=5, b=3]
iload_2: Stack=[5,3], Locals=[a=5, b=3]
iadd: Stack=[8], Locals=[a=5, b=3]
ireturn: Return 8
```

**虛擬機執行器實作**

```typescript
class SimpleVM {
    private code: Instruction[];
    private pc: number = 0;
    private stack: number[] = [];
    private locals: number[] = [];
    
    execute() {
        while (this.pc < this.code.length) {
            const inst = this.code[this.pc];
            
            switch (inst.opcode) {
                case 'PUSH':
                    this.stack.push(inst.operand);
                    this.pc++;
                    break;
                    
                case 'LOAD':
                    this.stack.push(this.locals[inst.operand]);
                    this.pc++;
                    break;
                    
                case 'STORE':
                    this.locals[inst.operand] = this.stack.pop();
                    this.pc++;
                    break;
                    
                case 'ADD':
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a + b);
                    this.pc++;
                    break;
                    
                case 'JMP':
                    this.pc = inst.operand;
                    break;
                    
                case 'JZ':
                    if (this.stack.pop() === 0) {
                        this.pc = inst.operand;
                    } else {
                        this.pc++;
                    }
                    break;
                    
                case 'HALT':
                    return;
            }
        }
    }
}
```

### 6.3 JIT 編譯

**熱點檢測**

```typescript
class HotspotDetector {
    private invocationCounts = new Map<string, number>();
    private threshold = 10000;
    
    onMethodEntry(methodName: string) {
        const count = (this.invocationCounts.get(methodName) || 0) + 1;
        this.invocationCounts.set(methodName, count);
        
        if (count === this.threshold) {
            this.compileMethod(methodName);
        }
    }
    
    private compileMethod(methodName: string) {
        // 使用 JIT 編譯器編譯成機器碼
        const machineCode = this.jitCompiler.compile(methodName);
        this.nativeCodeCache.set(methodName, machineCode);
    }
}
```

**分層編譯**

```
層級 0: 直譯器 (Interpreter)
  ↓ 調用次數達到閾值
層級 1: C1 編譯器 (快速編譯)
  ↓ 收集分析資料
層級 4: C2 編譯器 (深度優化)
```

### 6.4 垃圾回收

**標記-清除 (Mark-Sweep)**

```typescript
class MarkSweepGC {
    collect() {
        // 1. 標記階段
        this.mark();
        
        // 2. 清除階段
        this.sweep();
    }
    
    private mark() {
        const worklist: Object[] = [...this.gcRoots];
        
        while (worklist.length > 0) {
            const obj = worklist.pop();
            if (!obj.marked) {
                obj.marked = true;
                worklist.push(...obj.references);
            }
        }
    }
    
    private sweep() {
        for (const obj of this.heap.allObjects()) {
            if (!obj.marked) {
                this.heap.free(obj);
            } else {
                obj.marked = false;  // 重置標記
            }
        }
    }
}
```

**分代回收**

```
年輕代 (Young Generation):
  - Eden 區
  - Survivor 0
  - Survivor 1

老年代 (Old Generation)

流程:
1. 新物件分配在 Eden
2. Minor GC: 存活物件 → Survivor
3. 多次 GC 後仍存活 → 老年代
4. Major GC: 回收老年代
```

**互動式展示建議**
```
實作要點：
1. 視覺化堆疊記憶體的分配和回收
2. 動畫演示 GC 的標記和清除過程
3. 顯示分代回收中物件的晉升
4. 比較不同 GC 演算法的效能
5. 提供 GC 參數調整並顯示影響
```

---

## 第七部分：軟體與韌體對照

### 7.1 記憶體佈局對照

**軟體記憶體 (虛擬位址空間)**

```
0xFFFFFFFF ┌────────────────┐
           │  Kernel Space   │
0xC0000000 ├────────────────┤
           │  Stack ↓        │
           │                 │
           │  Memory Map     │
           │                 │
           │  Heap ↑         │
           ├────────────────┤
           │  BSS            │
           ├────────────────┤
           │  Data           │
           ├────────────────┤
           │  Text (Code)    │
0x08000000 ├────────────────┤
           │  Reserved       │
0x00000000 └────────────────┘
```

**韌體記憶體 (實體位址)**

```
0xFFFFFFFF ┌────────────────┐
           │  External Dev   │
0x60000000 ├────────────────┤
           │  Peripherals    │
           │  - GPIO         │
           │  - UART         │
0x40000000 ├────────────────┤
           │  SRAM           │
           │  - Stack        │
           │  - Heap         │
           │  - BSS          │
           │  - Data         │
0x20000000 ├────────────────┤
           │  Flash          │
           │  - Code         │
           │  - Const Data   │
           │  - ISR Vector   │
0x08000000 └────────────────┘
```

### 7.2 啟動過程對照

**軟體啟動**

```
1. OS 載入器讀取可執行檔
2. 建立 Process
3. 分配虛擬位址空間
4. 載入代碼和資料
5. 載入動態函式庫
6. _start (C Runtime)
7. main()
```

**韌體啟動**

```c
// 中斷向量表 (位於 Flash 開頭)
void (* const vectors[])(void) = {
    (void (*)(void))(&_estack),  // Stack Pointer
    Reset_Handler,                // Reset
    // ... 其他中斷
};

void Reset_Handler(void) {
    // 1. 複製 .data 從 Flash 到 SRAM
    memcpy(&_sdata, &_sidata, &_edata - &_sdata);
    
    // 2. 清零 .bss
    memset(&_sbss, 0, &_ebss - &_sbss);
    
    // 3. 初始化硬體
    SystemInit();
    
    // 4. 呼叫 main
    main();
    
    // 5. 如果返回，進入無限迴圈
    while(1);
}
```

**對照表**

| 步驟 | 軟體 | 韌體 |
|-----|------|------|
| 1 | OS 載入器 | CPU 自動載入 SP |
| 2 | 建立 Process | CPU 跳轉 Reset_Handler |
| 3 | 分配虛擬記憶體 | 複製 .data |
| 4 | 載入動態庫 | 清零 .bss |
| 5 | C Runtime 初始化 | 硬體初始化 |
| 6 | main() | main() |

---

## 第八部分：實作框架

### 8.1 簡單編譯器完整實作

```typescript
// 完整的編譯器流程
class SimpleCompiler {
    compile(sourceCode: string): string {
        // 1. 詞法分析
        const lexer = new Lexer(sourceCode);
        const tokens = lexer.tokenize();
        
        // 2. 語法分析
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        // 3. 語義分析
        const typeChecker = new TypeChecker();
        typeChecker.check(ast);
        
        // 4. IR 生成
        const irGen = new IRGenerator();
        const ir = irGen.generate(ast);
        
        // 5. 優化
        const optimizer = new Optimizer();
        const optimizedIR = optimizer.optimize(ir);
        
        // 6. 代碼生成
        const codeGen = new CodeGenerator('x86-64');
        const assembly = codeGen.generate(optimizedIR);
        
        return assembly;
    }
}
```

### 8.2 簡單虛擬機完整實作

```typescript
// 完整的虛擬機實作
class VirtualMachine {
    private code: Instruction[] = [];
    private pc: number = 0;
    private stack: any[] = [];
    private heap: Map<number, any> = new Map();
    private frames: StackFrame[] = [];
    
    load(program: Instruction[]) {
        this.code = program;
        this.reset();
    }
    
    run() {
        while (this.pc < this.code.length) {
            this.step();
        }
    }
    
    step() {
        const inst = this.code[this.pc];
        this.executeInstruction(inst);
    }
    
    private executeInstruction(inst: Instruction) {
        switch (inst.opcode) {
            case Opcode.PUSH:
                this.stack.push(inst.operand);
                break;
            case Opcode.POP:
                this.stack.pop();
                break;
            case Opcode.ADD:
                const b = this.stack.pop();
                const a = this.stack.pop();
                this.stack.push(a + b);
                break;
            // ... 其他指令
        }
        this.pc++;
    }
}
```

---

## 總結

這份教學架構涵蓋了：

1. **基礎概念**：執行模型、軟體vs韌體對照
2. **編譯器前端**：詞法、語法、語義分析
3. **編譯器後端**：IR、優化、代碼生成、連結
4. **虛擬機**：架構、位元碼、JIT、GC
5. **實作框架**：可直接使用的程式碼範例

**使用建議：**
- 每個章節都適合做成互動式網頁
- 可以選擇性實作感興趣的部分
- 建議從簡單的虛擬機開始實作
- 逐步增加複雜度

**下一步：**
將此架構交給前端開發 AI，實作成：
- React 互動式網站
- 代碼編輯器 + 實時預覽
- 可視化動畫
- Step-by-step 除錯器