import { Token, TokenType, ASTNode, CompileError } from '@/types'

let nodeIdCounter = 0

export class Parser {
  private tokens: Token[]
  private position: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): ASTNode {
    return this.parseProgram()
  }

  private parseProgram(): ASTNode {
    const statements: ASTNode[] = []

    while (!this.isAtEnd()) {
      statements.push(this.parseStatement())
    }

    return {
      id: this.generateId(),
      type: 'Program',
      children: statements,
      sourceSpan: { start: 0, end: this.tokens[this.tokens.length - 1]?.span.end || 0 }
    }
  }

  private parseStatement(): ASTNode {
    try {
      // 變數宣告
      if (this.check('int') || this.check('double') || this.check('string') || this.check('bool')) {
        return this.parseVarDecl()
      }

      // if 陳述式
      if (this.match('if')) {
        return this.parseIfStatement()
      }

      // while 迴圈
      if (this.match('while')) {
        return this.parseWhileStatement()
      }

      // return 陳述式
      if (this.match('return')) {
        return this.parseReturnStatement()
      }

      // 表達式陳述式
      return this.parseExpressionStatement()
    } catch (error) {
      // 錯誤恢復：跳到下一個分號或語句邊界
      this.synchronize()
      throw error
    }
  }

  private synchronize() {
    while (!this.isAtEnd()) {
      if (this.previous().value === ';') return

      switch (this.current().value) {
        case 'int':
        case 'double':
        case 'string':
        case 'bool':
        case 'if':
        case 'while':
        case 'return':
          return
      }

      this.advance()
    }
  }

  private parseVarDecl(): ASTNode {
    const typeToken = this.advance()
    const nameToken = this.consume(TokenType.IDENTIFIER, '期望變數名稱')

    let initializer: ASTNode | null = null
    if (this.match('=')) {
      this.advance()
      initializer = this.parseExpression()
    }

    // 允許省略分號
    if (this.check(';')) {
      this.advance()
    }

    return {
      id: this.generateId(),
      type: 'VariableDecl',
      varType: typeToken.value,
      name: nameToken.value,
      initializer,
      sourceSpan: { start: typeToken.span.start, end: this.previous().span.end }
    }
  }

  private parseIfStatement(): ASTNode {
    const startSpan = this.previous().span.start
    this.consume('(', "期望 '('")
    const condition = this.parseExpression()
    this.consume(')', "期望 ')'")

    const thenBranch = this.parseStatement()

    let elseBranch: ASTNode | null = null
    if (this.match('else')) {
      this.advance()
      elseBranch = this.parseStatement()
    }

    return {
      id: this.generateId(),
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch,
      sourceSpan: { start: startSpan, end: this.previous().span.end }
    }
  }

  private parseWhileStatement(): ASTNode {
    const startSpan = this.previous().span.start
    this.consume('(', "期望 '('")
    const condition = this.parseExpression()
    this.consume(')', "期望 ')'")

    const body = this.parseStatement()

    return {
      id: this.generateId(),
      type: 'WhileLoop',
      condition,
      body,
      sourceSpan: { start: startSpan, end: this.previous().span.end }
    }
  }

  private parseReturnStatement(): ASTNode {
    const startSpan = this.previous().span.start
    let value: ASTNode | null = null

    if (!this.check(';')) {
      value = this.parseExpression()
    }

    this.consume(';', "期望 ';'")

    return {
      id: this.generateId(),
      type: 'ReturnStatement',
      value,
      sourceSpan: { start: startSpan, end: this.previous().span.end }
    }
  }

  private parseExpressionStatement(): ASTNode {
    const expr = this.parseExpression()
    
    // 允許省略分號
    if (this.check(';')) {
      this.advance()
    }

    return {
      id: this.generateId(),
      type: 'ExpressionStatement',
      expression: expr,
      sourceSpan: expr.sourceSpan
    }
  }

  private parseExpression(): ASTNode {
    return this.parseComparison()
  }

  private parseComparison(): ASTNode {
    let expr = this.parseAdditive()

    while (this.match('<', '>', '==', '!=', '<=', '>=')) {
      const operator = this.previous()
      const right = this.parseAdditive()
      expr = {
        id: this.generateId(),
        type: 'BinaryOp',
        operator: operator.value,
        left: expr,
        right,
        sourceSpan: { start: expr.sourceSpan.start, end: right.sourceSpan.end }
      }
    }

    return expr
  }

  private parseAdditive(): ASTNode {
    let expr = this.parseMultiplicative()

    while (this.match('+', '-')) {
      const operator = this.previous()
      const right = this.parseMultiplicative()
      expr = {
        id: this.generateId(),
        type: 'BinaryOp',
        operator: operator.value,
        left: expr,
        right,
        sourceSpan: { start: expr.sourceSpan.start, end: right.sourceSpan.end }
      }
    }

    return expr
  }

  private parseMultiplicative(): ASTNode {
    let expr = this.parseUnary()

    while (this.match('*', '/')) {
      const operator = this.previous()
      const right = this.parseUnary()
      expr = {
        id: this.generateId(),
        type: 'BinaryOp',
        operator: operator.value,
        left: expr,
        right,
        sourceSpan: { start: expr.sourceSpan.start, end: right.sourceSpan.end }
      }
    }

    return expr
  }

  private parseUnary(): ASTNode {
    if (this.match('-', '!')) {
      const operator = this.previous()
      const operand = this.parseUnary()
      return {
        id: this.generateId(),
        type: 'UnaryOp',
        operator: operator.value,
        operand,
        sourceSpan: { start: operator.span.start, end: operand.sourceSpan.end }
      }
    }

    return this.parsePrimary()
  }

  private parsePrimary(): ASTNode {
    // 數字或字串字面量
    if (this.check(TokenType.LITERAL)) {
      const token = this.advance()
      return {
        id: this.generateId(),
        type: 'Literal',
        value: token.value,
        sourceSpan: token.span
      }
    }

    // 識別符
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance()
      return {
        id: this.generateId(),
        type: 'Identifier',
        name: name.value,
        sourceSpan: name.span
      }
    }

    // 括號表達式
    if (this.match('(')) {
      this.advance()
      const expr = this.parseExpression()
      if (this.check(')')) {
        this.advance()
      }
      return expr
    }

    // 如果到達這裡，表示遇到未預期的 token
    // 但我們不拋出錯誤，而是創建一個錯誤節點
    const current = this.current()
    
    // 跳過這個 token 並繼續
    this.advance()
    
    return {
      id: this.generateId(),
      type: 'Identifier',
      name: `<錯誤: 無法解析 '${current.value}'>`,
      sourceSpan: current.span,
      error: true
    }
  }

  private match(...values: string[]): boolean {
    for (const value of values) {
      if (this.check(value)) {
        return true
      }
    }
    return false
  }

  private check(typeOrValue: string | TokenType): boolean {
    if (this.isAtEnd()) return false
    const current = this.current()
    return current.type === typeOrValue || current.value === typeOrValue
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.position++
    return this.previous()
  }

  private consume(expected: string, message: string): Token {
    if (this.check(expected)) return this.advance()

    const current = this.current()
    throw new CompileError(message, current.line, current.column)
  }

  private current(): Token {
    return this.tokens[this.position]
  }

  private previous(): Token {
    return this.tokens[this.position - 1]
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length
  }

  private generateId(): string {
    return `node_${nodeIdCounter++}`
  }
}
