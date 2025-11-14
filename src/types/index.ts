// Token 類型定義
export enum TokenType {
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',
  LITERAL = 'LITERAL',
  OPERATOR = 'OPERATOR',
  SEPARATOR = 'SEPARATOR',
  COMMENT = 'COMMENT'
}

export interface SourceSpan {
  start: number
  end: number
}

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
  span: SourceSpan
}

// AST 節點類型
export type NodeType =
  | 'Program'
  | 'FunctionDecl'
  | 'VariableDecl'
  | 'BinaryOp'
  | 'UnaryOp'
  | 'Literal'
  | 'Identifier'
  | 'IfStatement'
  | 'WhileLoop'
  | 'ReturnStatement'
  | 'ExpressionStatement'
  | 'BlockStatement'

export interface ASTNode {
  id: string
  type: NodeType
  children?: ASTNode[]
  value?: any
  sourceSpan: SourceSpan
  [key: string]: any
}

// 虛擬機指令
export enum Opcode {
  PUSH = 'PUSH',
  POP = 'POP',
  LOAD = 'LOAD',
  STORE = 'STORE',
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  EQ = 'EQ',
  NEQ = 'NEQ',
  LT = 'LT',
  GT = 'GT',
  JMP = 'JMP',
  JZ = 'JZ',
  CALL = 'CALL',
  RET = 'RET',
  HALT = 'HALT',
  PRINT = 'PRINT'
}

export interface Instruction {
  opcode: Opcode
  operand?: number | string
}

// 虛擬機狀態
export interface VMState {
  pc: number
  stack: any[]
  locals: Record<string, any>
  heap: Map<number, any>
  callStack: number[]
  output: string[]
  isFinished: boolean
}

// 記憶體佈局
export interface MemorySegment {
  name: string
  startAddress: string
  endAddress: string
  size: string
  color: string
  type: 'code' | 'data' | 'stack' | 'heap' | 'peripheral' | 'reserved'
  description: string
}

// 類型系統
export enum Type {
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  STRING = 'STRING',
  BOOL = 'BOOL',
  VOID = 'VOID',
  ERROR = 'ERROR'
}

export interface Symbol {
  name: string
  type: Type
  kind: 'variable' | 'function' | 'parameter'
  scope: number
}

// 編譯錯誤
export class CompileError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public length: number = 1
  ) {
    super(message)
    this.name = 'CompileError'
  }
}
