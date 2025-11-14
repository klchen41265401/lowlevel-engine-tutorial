# 虛擬機與編譯器底層引擎完整教學架構 - 第三部分

## 互動式網站實作指南

---

## 第九部分：互動式網站架構設計

### 9.1 網站結構規劃

**網站地圖**

```
首頁 (/)
├── 學習路徑選擇
├── 快速開始
└── 特色功能展示

第一章：基礎概念 (/basics)
├── 1.1 執行模型比較
├── 1.2 軟體 vs 韌體對照
└── 1.3 互動式流程圖

第二章：編譯器深度解析 (/compiler)
├── 2.1 編譯器總覽
├── 2.2 預處理器 (互動式)
├── 2.3 詞法分析 (可視化)
├── 2.4 語法分析 (AST 生成)
├── 2.5 語義分析 (類型檢查)
├── 2.6 優化技術 (對比展示)
└── 2.7 代碼生成 (組合語言)

第三章：虛擬機原理 (/vm)
├── 3.1 虛擬機架構
├── 3.2 位元碼執行 (step-by-step)
├── 3.3 JIT 編譯
└── 3.4 垃圾回收 (動畫演示)

第四章：韌體開發 (/firmware)
├── 4.1 編譯流程對照
├── 4.2 記憶體管理
├── 4.3 啟動過程
├── 4.4 中斷處理
└── 4.5 實作專案

第五章：動手實作 (/practice)
├── 5.1 簡易虛擬機
├── 5.2 簡易編譯器
└── 5.3 進階專案

資源 (/resources)
├── 術語表
├── 參考資料
├── 常見問題
└── 程式碼範例
```

### 9.2 頁面組件設計

**通用組件**

```typescript
// 代碼編輯器組件
interface CodeEditorProps {
  language: 'cpp' | 'java' | 'asm' | 'python';
  value: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  highlightLines?: number[];
  theme?: 'dark' | 'light';
}

// 輸出展示組件
interface OutputPanelProps {
  title: string;
  content: string | React.ReactNode;
  type: 'text' | 'json' | 'tree' | 'table';
  collapsible?: boolean;
}

// 執行控制組件
interface ExecutionControlProps {
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onPause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isRunning: boolean;
}

// 可視化組件
interface VisualizerProps {
  type: 'ast' | 'memory' | 'stack' | 'flow';
  data: any;
  highlightNodes?: string[];
  onNodeClick?: (node: any) => void;
}
```

**專用組件**

```typescript
// 詞法分析器組件
interface LexerVisualizerProps {
  sourceCode: string;
  tokens: Token[];
  currentTokenIndex: number;
  onTokenClick: (token: Token) => void;
}

// AST 可視化組件
interface ASTVisualizerProps {
  ast: ASTNode;
  expandedNodes: Set<string>;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeExpand: (nodeId: string) => void;
}

// 記憶體佈局組件
interface MemoryLayoutProps {
  layout: MemorySegment[];
  allocations: Allocation[];
  highlightAddress?: number;
  type: 'software' | 'firmware';
}

// 虛擬機狀態組件
interface VMStateProps {
  pc: number;
  stack: any[];
  locals: any[];
  heap: Map<number, any>;
  instructions: Instruction[];
}

// 對照表組件
interface ComparisonTableProps {
  leftTitle: string;
  rightTitle: string;
  rows: ComparisonRow[];
  interactive?: boolean;
}
```

### 9.3 互動功能實作

**1. 詞法分析器頁面**

```tsx
// LexerPage.tsx
import React, { useState, useEffect } from 'react';
import { CodeEditor, TokenList, FSMVisualizer } from '@/components';
import { Lexer } from '@/lib/compiler';

export default function LexerPage() {
  const [sourceCode, setSourceCode] = useState('int x = 10 + 20;');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentToken, setCurrentToken] = useState(0);
  const [fsmState, setFsmState] = useState('START');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRun = () => {
    const lexer = new Lexer(sourceCode);
    const tokenList = lexer.tokenize();
    setTokens(tokenList);
  };

  const handleStepForward = () => {
    if (currentToken < tokens.length - 1) {
      setCurrentToken(currentToken + 1);
    }
  };

  const handleTokenClick = (token: Token) => {
    // 高亮源代碼中對應的位置
    setCurrentToken(tokens.indexOf(token));
  };

  return (
    <div className="container mx-auto p-6">
      {/* 概念說明 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">詞法分析器 (Lexer)</h1>
        <p className="text-lg text-gray-700">
          詞法分析器將源代碼字串分解為有意義的最小單位（Token）...
        </p>
      </section>

      {/* 互動式演示 */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          {/* 左側：代碼編輯器 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">源代碼</h2>
            <CodeEditor
              language="cpp"
              value={sourceCode}
              onChange={setSourceCode}
              highlightLines={tokens[currentToken]?.line ? [tokens[currentToken].line] : []}
            />
          </div>

          {/* 右側：Token 列表 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Token 流</h2>
            <TokenList
              tokens={tokens}
              currentIndex={currentToken}
              onTokenClick={handleTokenClick}
            />
          </div>
        </div>

        {/* FSM 可視化 */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">有限狀態機</h2>
          <FSMVisualizer
            currentState={fsmState}
            transitions={lexerFSMTransitions}
          />
        </div>

        {/* 控制按鈕 */}
        <div className="mt-4 flex gap-2">
          <button onClick={handleRun} className="btn btn-primary">
            運行
          </button>
          <button onClick={handleStepForward} className="btn btn-secondary">
            單步執行
          </button>
          <button onClick={() => setTokens([])} className="btn btn-secondary">
            重置
          </button>
        </div>
      </section>

      {/* 範例代碼 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">範例</h2>
        <ExampleTabs
          examples={[
            { label: '簡單運算', code: 'int x = 10 + 20;' },
            { label: 'if 語句', code: 'if (x > 0) { y = 1; }' },
            { label: '函式定義', code: 'int add(int a, int b) { return a + b; }' }
          ]}
          onSelect={(code) => setSourceCode(code)}
        />
      </section>

      {/* 練習題 */}
      <section>
        <h2 className="text-xl font-semibold mb-2">練習</h2>
        <Exercise
          question="請寫出識別浮點數的正規表達式"
          hint="考慮小數點和指數表示法"
          solution="[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?"
        />
      </section>
    </div>
  );
}
```

**2. AST 可視化頁面**

```tsx
// ASTVisualizerPage.tsx
import React, { useState } from 'react';
import { Parser } from '@/lib/compiler';
import { ASTTree, CodeEditor } from '@/components';

export default function ASTVisualizerPage() {
  const [code, setCode] = useState('int result = (a + 3) * b;');
  const [ast, setAST] = useState<ASTNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleParse = () => {
    try {
      const parser = new Parser(code);
      const tree = parser.parse();
      setAST(tree);
    } catch (error) {
      alert(`解析錯誤: ${error.message}`);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    // 高亮源代碼中對應的範圍
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">抽象語法樹 (AST)</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* 代碼輸入 */}
        <div>
          <CodeEditor
            language="cpp"
            value={code}
            onChange={setCode}
          />
          <button onClick={handleParse} className="btn btn-primary mt-2">
            解析
          </button>
        </div>

        {/* AST 可視化 */}
        <div>
          {ast && (
            <ASTTree
              ast={ast}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>
      </div>

      {/* 節點詳細資訊 */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">節點資訊</h3>
          <pre>{JSON.stringify(findNode(ast, selectedNode), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

**3. 虛擬機執行器頁面**

```tsx
// VMExecutorPage.tsx
import React, { useState, useEffect } from 'react';
import { VirtualMachine } from '@/lib/vm';
import { VMState, InstructionList, StackVisualizer } from '@/components';

export default function VMExecutorPage() {
  const [program, setProgram] = useState<Instruction[]>([
    { opcode: 'PUSH', operand: 10 },
    { opcode: 'PUSH', operand: 20 },
    { opcode: 'ADD' },
    { opcode: 'HALT' }
  ]);
  
  const [vm] = useState(new VirtualMachine());
  const [state, setState] = useState(vm.getState());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per step

  useEffect(() => {
    vm.load(program);
  }, [program]);

  const handleStep = () => {
    vm.step();
    setState(vm.getState());
  };

  const handleRun = () => {
    setIsRunning(true);
    const interval = setInterval(() => {
      if (vm.isFinished()) {
        clearInterval(interval);
        setIsRunning(false);
      } else {
        vm.step();
        setState(vm.getState());
      }
    }, speed);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">虛擬機執行器</h1>

      <div className="grid grid-cols-3 gap-4">
        {/* 指令列表 */}
        <div>
          <h2 className="text-xl font-semibold mb-2">指令</h2>
          <InstructionList
            instructions={program}
            currentPC={state.pc}
          />
        </div>

        {/* 堆疊可視化 */}
        <div>
          <h2 className="text-xl font-semibold mb-2">堆疊</h2>
          <StackVisualizer stack={state.stack} />
        </div>

        {/* 局部變數 */}
        <div>
          <h2 className="text-xl font-semibold mb-2">局部變數</h2>
          <LocalsTable locals={state.locals} />
        </div>
      </div>

      {/* 控制面板 */}
      <div className="mt-4 flex gap-2 items-center">
        <button onClick={handleStep} disabled={isRunning} className="btn">
          單步執行
        </button>
        <button onClick={handleRun} disabled={isRunning} className="btn">
          運行
        </button>
        <button onClick={() => vm.reset()} className="btn">
          重置
        </button>
        <label className="ml-4">
          速度:
          <input
            type="range"
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="ml-2"
          />
        </label>
      </div>
    </div>
  );
}
```

**4. 記憶體對照頁面**

```tsx
// MemoryComparisonPage.tsx
import React, { useState } from 'react';
import { MemoryLayout, ComparisonArrows } from '@/components';

export default function MemoryComparisonPage() {
  const [scenario, setScenario] = useState('allocation');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">記憶體管理對照</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* 軟體記憶體 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">軟體記憶體 (x86-64)</h2>
          <MemoryLayout
            type="software"
            segments={softwareMemoryLayout}
            highlightSegment={scenario === 'allocation' ? 'heap' : null}
          />
        </div>

        {/* 連接線 */}
        <ComparisonArrows connections={memoryConnections} />

        {/* 韌體記憶體 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">韌體記憶體 (STM32)</h2>
          <MemoryLayout
            type="firmware"
            segments={firmwareMemoryLayout}
            highlightSegment={scenario === 'allocation' ? 'sram' : null}
          />
        </div>
      </div>

      {/* 場景選擇 */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">場景演示</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setScenario('allocation')}
            className={scenario === 'allocation' ? 'btn-active' : 'btn'}
          >
            記憶體分配
          </button>
          <button
            onClick={() => setScenario('access')}
            className={scenario === 'access' ? 'btn-active' : 'btn'}
          >
            記憶體存取
          </button>
          <button
            onClick={() => setScenario('interrupt')}
            className={scenario === 'interrupt' ? 'btn-active' : 'btn'}
          >
            中斷處理
          </button>
        </div>
      </div>

      {/* 代碼對照 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">軟體範例</h3>
          <CodeBlock language="cpp" code={softwareExampleCode[scenario]} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">韌體範例</h3>
          <CodeBlock language="c" code={firmwareExampleCode[scenario]} />
        </div>
      </div>
    </div>
  );
}
```

### 9.4 資料結構設計

```typescript
// types.ts - 核心資料結構

// Token 定義
interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  span: SourceSpan;
}

enum TokenType {
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',
  LITERAL = 'LITERAL',
  OPERATOR = 'OPERATOR',
  SEPARATOR = 'SEPARATOR'
}

interface SourceSpan {
  start: number;
  end: number;
}

// AST 節點定義
interface ASTNode {
  id: string;
  type: NodeType;
  children: ASTNode[];
  value?: any;
  sourceSpan: SourceSpan;
  typeInfo?: TypeInfo;
}

type NodeType =
  | 'Program'
  | 'FunctionDecl'
  | 'VariableDecl'
  | 'BinaryOp'
  | 'UnaryOp'
  | 'Literal'
  | 'Identifier'
  | 'IfStatement'
  | 'WhileLoop'
  | 'ReturnStatement';

// 虛擬機指令定義
interface Instruction {
  opcode: Opcode;
  operand?: number | string;
}

enum Opcode {
  PUSH = 'PUSH',
  POP = 'POP',
  LOAD = 'LOAD',
  STORE = 'STORE',
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  JMP = 'JMP',
  JZ = 'JZ',
  CALL = 'CALL',
  RET = 'RET',
  HALT = 'HALT'
}

// 虛擬機狀態定義
interface VMState {
  pc: number;
  stack: any[];
  locals: any[];
  heap: Map<number, any>;
  callStack: number[];
}

// 記憶體佈局定義
interface MemoryLayout {
  segments: MemorySegment[];
  totalSize: number;
}

interface MemorySegment {
  name: string;
  startAddress: number;
  size: number;
  color: string;
  type: 'code' | 'data' | 'stack' | 'heap' | 'peripheral';
  content?: MemoryBlock[];
}

interface MemoryBlock {
  address: number;
  size: number;
  type: 'variable' | 'object' | 'code' | 'free';
  name?: string;
  value?: any;
}

// 優化資訊定義
interface OptimizationResult {
  before: string;
  after: string;
  optimizations: OptimizationStep[];
  performanceGain: number;
  codeSizeChange: number;
}

interface OptimizationStep {
  type: string;
  description: string;
  location: SourceSpan;
  impact: 'high' | 'medium' | 'low';
}
```

### 9.5 技術堆疊建議

**前端框架：**
- React 18+ with TypeScript
- Next.js (用於 SSR 和路由)

**UI 組件庫：**
- Tailwind CSS (樣式)
- Radix UI 或 shadcn/ui (無樣式組件)
- Lucide React (圖標)

**代碼編輯器：**
- Monaco Editor (VS Code 的編輯器核心)
- 或 CodeMirror 6 (更輕量)

**圖表與可視化：**
- D3.js (自定義圖表)
- React Flow (節點流程圖)
- Recharts (數據圖表)
- vis.js (網絡圖)

**動畫：**
- Framer Motion (聲明式動畫)
- GSAP (高性能動畫)

**狀態管理：**
- Zustand (輕量級狀態管理)
- 或 Redux Toolkit (複雜狀態)

**編譯器/虛擬機核心邏輯：**
- 純 TypeScript 實作
- Web Workers (用於編譯/執行，避免阻塞 UI)

**部署：**
- Vercel 或 Netlify (靜態網站託管)
- GitHub Pages (開源專案)

### 9.6 專案結構

```
project/
├── src/
│   ├── app/                    # Next.js 頁面
│   │   ├── page.tsx           # 首頁
│   │   ├── basics/            # 基礎概念
│   │   ├── compiler/          # 編譯器章節
│   │   ├── vm/                # 虛擬機章節
│   │   ├── firmware/          # 韌體章節
│   │   └── practice/          # 實作練習
│   │
│   ├── components/            # React 組件
│   │   ├── CodeEditor.tsx
│   │   ├── ASTVisualizer.tsx
│   │   ├── VMExecutor.tsx
│   │   ├── MemoryLayout.tsx
│   │   └── ...
│   │
│   ├── lib/                   # 核心邏輯
│   │   ├── compiler/
│   │   │   ├── lexer.ts
│   │   │   ├── parser.ts
│   │   │   ├── type-checker.ts
│   │   │   ├── ir-generator.ts
│   │   │   ├── optimizer.ts
│   │   │   └── code-generator.ts
│   │   │
│   │   ├── vm/
│   │   │   ├── virtual-machine.ts
│   │   │   ├── jit-compiler.ts
│   │   │   └── garbage-collector.ts
│   │   │
│   │   └── utils/
│   │       ├── ast-utils.ts
│   │       ├── memory-utils.ts
│   │       └── visualization-utils.ts
│   │
│   ├── hooks/                 # 自定義 React Hooks
│   │   ├── useCompiler.ts
│   │   ├── useVM.ts
│   │   └── useAnimation.ts
│   │
│   ├── types/                 # TypeScript 類型定義
│   │   ├── ast.ts
│   │   ├── ir.ts
│   │   ├── vm.ts
│   │   └── memory.ts
│   │
│   └── styles/               # 樣式文件
│       └── globals.css
│
├── public/                   # 靜態資源
│   ├── examples/            # 範例代碼
│   ├── diagrams/            # 圖表
│   └── assets/              # 圖片、圖標
│
├── docs/                    # 文檔
│   └── architecture.md
│
├── tests/                   # 測試
│   ├── compiler.test.ts
│   └── vm.test.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 第十部分：實作最佳實踐

### 10.1 效能優化

**1. 編譯器/虛擬機運行在 Web Worker**

```typescript
// compiler.worker.ts
self.onmessage = (e) => {
  const { type, payload } = e.data;
  
  if (type === 'COMPILE') {
    const compiler = new Compiler();
    const result = compiler.compile(payload.code);
    self.postMessage({ type: 'COMPILE_RESULT', payload: result });
  }
};

// 主執行緒
const compilerWorker = new Worker('compiler.worker.ts');

compilerWorker.postMessage({ type: 'COMPILE', payload: { code: sourceCode } });

compilerWorker.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type === 'COMPILE_RESULT') {
    setCompileResult(payload);
  }
};
```

**2. 虛擬滾動處理大型代碼**

```tsx
import { FixedSizeList } from 'react-window';

function CodeLineList({ lines }: { lines: string[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={lines.length}
      itemSize={20}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <span className="line-number">{index + 1}</span>
          <span className="code-content">{lines[index]}</span>
        </div>
      )}
    </FixedSizeList>
  );
}
```

**3. 節流處理高頻事件**

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function useDebounceCompile() {
  const compile = useMemo(
    () => debounce((code: string) => {
      // 編譯邏輯
      const result = compiler.compile(code);
      setResult(result);
    }, 300),
    []
  );
  
  return compile;
}
```

### 10.2 使用者體驗優化

**1. 載入狀態**

```tsx
function CompilerPage() {
  const [isCompiling, setIsCompiling] = useState(false);
  
  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compileCode(sourceCode);
      setResult(result);
    } finally {
      setIsCompiling(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleCompile} disabled={isCompiling}>
        {isCompiling ? <Spinner /> : '編譯'}
      </button>
    </div>
  );
}
```

**2. 錯誤處理**

```tsx
function CodeEditor({ onCompile }: Props) {
  const [errors, setErrors] = useState<CompileError[]>([]);
  
  const handleCompile = () => {
    try {
      const result = compiler.compile(code);
      setErrors([]);
      onCompile(result);
    } catch (error) {
      if (error instanceof CompileError) {
        setErrors([error]);
      }
    }
  };
  
  return (
    <div>
      <MonacoEditor
        value={code}
        onChange={setCode}
        markers={errors.map(e => ({
          startLineNumber: e.line,
          startColumn: e.column,
          endLineNumber: e.line,
          endColumn: e.column + e.length,
          message: e.message,
          severity: MarkerSeverity.Error
        }))}
      />
    </div>
  );
}
```

**3. 教學引導**

```tsx
import { Joyride } from 'react-joyride';

function Tutorial() {
  const [runTour, setRunTour] = useState(true);
  
  const steps = [
    {
      target: '.code-editor',
      content: '在這裡輸入你的代碼',
    },
    {
      target: '.run-button',
      content: '點擊這個按鈕來執行',
    },
    {
      target: '.output-panel',
      content: '結果會顯示在這裡',
    },
  ];
  
  return <Joyride steps={steps} run={runTour} />;
}
```

### 10.3 可訪問性 (Accessibility)

**1. 鍵盤導航**

```tsx
function VMControls() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        handleStep();
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleRun();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <div>
      <button onClick={handleStep} title="單步執行 (F10)">
        Step
      </button>
      <button onClick={handleRun} title="運行 (F5)">
        Run
      </button>
    </div>
  );
}
```

**2. ARIA 標籤**

```tsx
<button
  aria-label="編譯當前代碼"
  aria-busy={isCompiling}
  aria-disabled={isCompiling}
  onClick={handleCompile}
>
  編譯
</button>
```

### 10.4 測試策略

**1. 單元測試 (Jest)**

```typescript
// lexer.test.ts
describe('Lexer', () => {
  test('should tokenize simple expression', () => {
    const lexer = new Lexer('int x = 10;');
    const tokens = lexer.tokenize();
    
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toMatchObject({
      type: TokenType.KEYWORD,
      value: 'int'
    });
  });
  
  test('should handle unterminated string', () => {
    const lexer = new Lexer('"unclosed string');
    expect(() => lexer.tokenize()).toThrow('Unterminated string');
  });
});
```

**2. 整合測試 (React Testing Library)**

```typescript
// CompilerPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CompilerPage from './CompilerPage';

test('should compile code and show output', async () => {
  render(<CompilerPage />);
  
  const editor = screen.getByRole('textbox');
  fireEvent.change(editor, { target: { value: 'int x = 10;' } });
  
  const compileButton = screen.getByText('編譯');
  fireEvent.click(compileButton);
  
  await screen.findByText(/編譯成功/);
  expect(screen.getByTestId('output')).toBeInTheDocument();
});
```

---

## 第十一部分：部署與維護

### 11.1 部署步驟

**1. 準備 (使用 Next.js)**

```bash
# 安裝依賴
npm install

# 建置
npm run build

# 本地測試
npm run start
```

**2. 部署到 Vercel**

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生產環境部署
vercel --prod
```

**3. 環境變數配置**

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 11.2 效能監控

**1. Web Vitals**

```tsx
// _app.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // 發送到分析服務
  if (metric.label === 'web-vital') {
    sendToAnalytics(metric);
  }
}
```

**2. 錯誤追蹤 (Sentry)**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 11.3 持續改進

**收集使用者反饋**

```tsx
function FeedbackWidget() {
  const [feedback, setFeedback] = useState('');
  
  const handleSubmit = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback, page: window.location.pathname })
    });
    alert('感謝你的反饋！');
  };
  
  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={() => setShowModal(true)}>
        💬 反饋
      </button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="告訴我們你的想法..."
          />
          <button onClick={handleSubmit}>提交</button>
        </Modal>
      )}
    </div>
  );
}
```

---

## 總結

這份完整的教學架構文檔包含：

### ✅ 已涵蓋的內容

1. **基礎概念**
   - 執行模型比較（編譯型、虛擬機型、直譯型）
   - 軟體與韌體對照

2. **編譯器深度剖析**
   - 預處理器、詞法分析、語法分析
   - 語義分析、中間表示
   - 優化技術、代碼生成
   - 連結過程

3. **虛擬機原理**
   - 虛擬機架構
   - 位元碼與指令集
   - JIT 編譯
   - 垃圾回收

4. **軟體與韌體對照**
   - 記憶體管理
   - 啟動過程
   - 中斷處理
   - 呼叫慣例

5. **互動式網站實作**
   - 網站結構設計
   - 組件設計
   - 互動功能實作
   - 技術堆疊建議
   - 效能優化
   - 部署與維護

### 📦 使用方式

**給 AI 的指令範例：**

```
請根據這份架構文檔，實作一個互動式的編譯器教學網站。
重點實作以下功能：

1. 首頁
2. 詞法分析器頁面（包含實時 Token 生成和可視化）
3. 語法分析器頁面（包含 AST 可視化）
4. 虛擬機執行器頁面（包含 step-by-step 執行）

技術棧：
- React + TypeScript
- Next.js
- Tailwind CSS
- Monaco Editor

請生成完整的專案結構和核心代碼。
```

### 🚀 下一步建議

1. **選擇實作範圍**：
   - 可以選擇只實作編譯器部分
   - 或只實作虛擬機部分
   - 或兩者都實作

2. **逐步實作**：
   - 先實作基本的詞法分析器
   - 再增加語法分析
   - 最後加入優化和可視化

3. **增強功能**：
   - 添加更多範例代碼
   - 支援更多程式語言
   - 加入社群功能（分享、討論）

### 📚 相關資源

**推薦閱讀：**
- "Compilers: Principles, Techniques, and Tools" (龍書)
- "Modern Compiler Implementation in C" (虎書)
- "The Garbage Collection Handbook"
- LLVM 官方文檔

**線上資源：**
- LLVM Tutorial
- JVM Specification
- GCC Internals Documentation

這份文檔已經非常完整，可以直接作為實作的藍圖。祝你實作順利！🎉