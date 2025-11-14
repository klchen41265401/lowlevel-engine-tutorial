import { Instruction, Opcode, VMState } from '@/types'

export class VirtualMachine {
  private code: Instruction[] = []
  private pc: number = 0
  private stack: any[] = []
  private locals: Record<string, any> = {}
  private heap: Map<number, any> = new Map()
  private callStack: number[] = []
  private output: string[] = []
  private isFinished: boolean = false

  load(program: Instruction[]) {
    this.code = program
    this.reset()
  }

  reset() {
    this.pc = 0
    this.stack = []
    this.locals = {}
    this.heap.clear()
    this.callStack = []
    this.output = []
    this.isFinished = false
  }

  getState(): VMState {
    return {
      pc: this.pc,
      stack: [...this.stack],
      locals: { ...this.locals },
      heap: new Map(this.heap),
      callStack: [...this.callStack],
      output: [...this.output],
      isFinished: this.isFinished
    }
  }

  step(): boolean {
    if (this.isFinished || this.pc >= this.code.length) {
      this.isFinished = true
      return false
    }

    const inst = this.code[this.pc]
    this.executeInstruction(inst)
    return !this.isFinished
  }

  run() {
    while (this.step()) {
      // 繼續執行
    }
  }

  private executeInstruction(inst: Instruction) {
    switch (inst.opcode) {
      case Opcode.PUSH:
        this.stack.push(inst.operand)
        this.pc++
        break

      case Opcode.POP:
        this.stack.pop()
        this.pc++
        break

      case Opcode.LOAD:
        if (typeof inst.operand === 'string') {
          const value = this.locals[inst.operand]
          if (value === undefined) {
            throw new Error(`未定義的變數: ${inst.operand}`)
          }
          this.stack.push(value)
        }
        this.pc++
        break

      case Opcode.STORE:
        if (typeof inst.operand === 'string') {
          this.locals[inst.operand] = this.stack.pop()
        }
        this.pc++
        break

      case Opcode.ADD: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a + b)
        this.pc++
        break
      }

      case Opcode.SUB: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a - b)
        this.pc++
        break
      }

      case Opcode.MUL: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a * b)
        this.pc++
        break
      }

      case Opcode.DIV: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        if (b === 0) {
          throw new Error('除以零錯誤')
        }
        this.stack.push(Math.floor(a / b))
        this.pc++
        break
      }

      case Opcode.EQ: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a === b ? 1 : 0)
        this.pc++
        break
      }

      case Opcode.NEQ: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a !== b ? 1 : 0)
        this.pc++
        break
      }

      case Opcode.LT: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a < b ? 1 : 0)
        this.pc++
        break
      }

      case Opcode.GT: {
        const b = this.stack.pop()
        const a = this.stack.pop()
        this.stack.push(a > b ? 1 : 0)
        this.pc++
        break
      }

      case Opcode.JMP:
        if (typeof inst.operand === 'number') {
          this.pc = inst.operand
        }
        break

      case Opcode.JZ: {
        const condition = this.stack.pop()
        if (condition === 0 && typeof inst.operand === 'number') {
          this.pc = inst.operand
        } else {
          this.pc++
        }
        break
      }

      case Opcode.CALL:
        this.callStack.push(this.pc + 1)
        if (typeof inst.operand === 'number') {
          this.pc = inst.operand
        }
        break

      case Opcode.RET:
        if (this.callStack.length > 0) {
          this.pc = this.callStack.pop()!
        } else {
          this.isFinished = true
        }
        break

      case Opcode.PRINT: {
        const value = this.stack.pop()
        this.output.push(String(value))
        this.pc++
        break
      }

      case Opcode.HALT:
        this.isFinished = true
        break

      default:
        throw new Error(`未知的指令: ${inst.opcode}`)
    }
  }

  getOutput(): string {
    return this.output.join('\n')
  }
}

// 簡單的編譯器：將 AST 轉換為虛擬機指令
export function compileToVM(ast: any): Instruction[] {
  const instructions: Instruction[] = []

  function compile(node: any) {
    if (!node) return

    switch (node.type) {
      case 'Program':
        node.children?.forEach(compile)
        instructions.push({ opcode: Opcode.HALT })
        break

      case 'VariableDecl':
        if (node.initializer) {
          compile(node.initializer)
          instructions.push({ opcode: Opcode.STORE, operand: node.name })
        }
        break

      case 'BinaryOp':
        compile(node.left)
        compile(node.right)
        switch (node.operator) {
          case '+': instructions.push({ opcode: Opcode.ADD }); break
          case '-': instructions.push({ opcode: Opcode.SUB }); break
          case '*': instructions.push({ opcode: Opcode.MUL }); break
          case '/': instructions.push({ opcode: Opcode.DIV }); break
          case '==': instructions.push({ opcode: Opcode.EQ }); break
          case '!=': instructions.push({ opcode: Opcode.NEQ }); break
          case '<': instructions.push({ opcode: Opcode.LT }); break
          case '>': instructions.push({ opcode: Opcode.GT }); break
        }
        break

      case 'Literal':
        instructions.push({ opcode: Opcode.PUSH, operand: parseFloat(node.value) })
        break

      case 'Identifier':
        instructions.push({ opcode: Opcode.LOAD, operand: node.name })
        break

      case 'ExpressionStatement':
        compile(node.expression)
        instructions.push({ opcode: Opcode.POP })
        break
    }
  }

  compile(ast)
  return instructions
}
