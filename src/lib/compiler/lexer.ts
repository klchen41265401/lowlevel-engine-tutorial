import { Token, TokenType, CompileError } from '@/types'

const KEYWORDS = new Set([
  'int', 'double', 'string', 'bool', 'void',
  'if', 'else', 'while', 'for', 'return',
  'class', 'function', 'const', 'let', 'var'
])

export class Lexer {
  private source: string
  private position: number = 0
  private line: number = 1
  private column: number = 0
  private tokens: Token[] = []

  constructor(source: string) {
    this.source = source
  }

  tokenize(): Token[] {
    this.tokens = []
    this.position = 0
    this.line = 1
    this.column = 0

    while (!this.isAtEnd()) {
      this.skipWhitespace()
      if (this.isAtEnd()) break

      const start = this.position
      const startColumn = this.column

      try {
        const char = this.currentChar()

        // 註解
        if (char === '/' && this.peekNext() === '/') {
          this.scanComment()
          continue
        }

        // 數字
        if (this.isDigit(char)) {
          this.scanNumber(start, startColumn)
          continue
        }

        // 字串
        if (char === '"' || char === "'") {
          this.scanString(start, startColumn)
          continue
        }

        // 識別符或關鍵字
        if (this.isAlpha(char) || char === '_') {
          this.scanIdentifier(start, startColumn)
          continue
        }

        // 運算符
        if (this.isOperatorChar(char)) {
          this.scanOperator(start, startColumn)
          continue
        }

        // 分隔符
        if (this.isSeparator(char)) {
          this.scanSeparator(start, startColumn)
          continue
        }

        throw new CompileError(
          `無法識別的字元: ${char}`,
          this.line,
          this.column
        )
      } catch (error) {
        if (error instanceof CompileError) {
          throw error
        }
        throw new CompileError(
          error instanceof Error ? error.message : String(error),
          this.line,
          this.column
        )
      }
    }

    return this.tokens
  }

  private scanNumber(start: number, startColumn: number) {
    let value = ''

    while (!this.isAtEnd() && this.isDigit(this.currentChar())) {
      value += this.currentChar()
      this.advance()
    }

    // 檢查小數點
    if (this.currentChar() === '.' && this.isDigit(this.peekNext())) {
      value += '.'
      this.advance()

      while (!this.isAtEnd() && this.isDigit(this.currentChar())) {
        value += this.currentChar()
        this.advance()
      }
    }

    this.tokens.push({
      type: TokenType.LITERAL,
      value,
      line: this.line,
      column: startColumn,
      span: { start, end: this.position }
    })
  }

  private scanString(start: number, startColumn: number) {
    const quote = this.currentChar()
    this.advance() // 跳過開始引號

    let value = ''
    while (!this.isAtEnd() && this.currentChar() !== quote) {
      if (this.currentChar() === '\n') {
        throw new CompileError('字串不能跨行', this.line, this.column)
      }
      value += this.currentChar()
      this.advance()
    }

    if (this.isAtEnd()) {
      throw new CompileError('未閉合的字串', this.line, startColumn)
    }

    this.advance() // 跳過結束引號

    this.tokens.push({
      type: TokenType.LITERAL,
      value: `"${value}"`,
      line: this.line,
      column: startColumn,
      span: { start, end: this.position }
    })
  }

  private scanIdentifier(start: number, startColumn: number) {
    let value = ''

    while (
      !this.isAtEnd() &&
      (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_')
    ) {
      value += this.currentChar()
      this.advance()
    }

    const type = KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER

    this.tokens.push({
      type,
      value,
      line: this.line,
      column: startColumn,
      span: { start, end: this.position }
    })
  }

  private scanOperator(start: number, startColumn: number) {
    let value = this.currentChar()
    this.advance()

    // 檢查兩字元運算符
    const twoChar = value + this.currentChar()
    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='].includes(twoChar)) {
      value = twoChar
      this.advance()
    }

    this.tokens.push({
      type: TokenType.OPERATOR,
      value,
      line: this.line,
      column: startColumn,
      span: { start, end: this.position }
    })
  }

  private scanSeparator(start: number, startColumn: number) {
    const value = this.currentChar()
    this.advance()

    this.tokens.push({
      type: TokenType.SEPARATOR,
      value,
      line: this.line,
      column: startColumn,
      span: { start, end: this.position }
    })
  }

  private scanComment() {
    while (!this.isAtEnd() && this.currentChar() !== '\n') {
      this.advance()
    }
  }

  private skipWhitespace() {
    while (!this.isAtEnd()) {
      const char = this.currentChar()
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance()
      } else if (char === '\n') {
        this.line++
        this.column = 0
        this.advance()
      } else {
        break
      }
    }
  }

  private currentChar(): string {
    return this.source[this.position]
  }

  private peekNext(): string {
    if (this.position + 1 >= this.source.length) return '\0'
    return this.source[this.position + 1]
  }

  private advance() {
    this.position++
    this.column++
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char)
  }

  private isOperatorChar(char: string): boolean {
    return '+-*/%=<>!&|'.includes(char)
  }

  private isSeparator(char: string): boolean {
    return '{}()[];,'.includes(char)
  }
}
