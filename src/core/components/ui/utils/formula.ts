/**
 * 计算组件的公式求值器。
 *
 * 这里刻意不把方案里的公式拼成 JS 再编译执行：公式与 COUNTIF 的条件都随方案 JSON 落库，
 * 属于「别人写、你打开表单就跑」的输入。求值只认白名单内的函数名与四则/比较运算符，
 * 拼错的、夹带语句的公式会在词法阶段被拒掉，而不是被执行。
 */

export type FormulaFunction = (...args: any[]) => any;

export class FormulaError extends Error {}

type Token =
  | { type: 'num'; value: number }
  | { type: 'str'; value: string }
  | { type: 'id'; value: string }
  | { type: 'op'; value: string }
  | { type: 'punc'; value: string };

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*/;
const NUMBER_RE = /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/;
const OPERATORS = [
  '===',
  '!==',
  '>=',
  '<=',
  '==',
  '!=',
  '<>',
  '>',
  '<',
  '=',
  '+',
  '-',
  '*',
  '/',
  '%',
];
const PUNCTUATIONS = ['(', ')', '[', ']', ','];

const MATH_FUNCTIONS: Record<string, FormulaFunction> = {
  abs: Math.abs,
  max: Math.max,
  min: Math.min,
  sqrt: Math.sqrt,
  floor: Math.floor,
  pow: Math.pow,
  random: Math.random,
};

const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  "'": "'",
  '"': '"',
};

function fail(message: string): never {
  throw new FormulaError(message);
}

function readString(source: string, start: number): { value: string; next: number } {
  const quote = source[start];
  let value = '';
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      const escaped = ESCAPES[source[i + 1]];
      if (escaped === undefined) {
        fail(`不支持的转义 \\${source[i + 1]}`);
      }
      value += escaped;
      i += 2;
      continue;
    }
    if (ch === quote) {
      return { value, next: i + 1 };
    }
    value += ch;
    i += 1;
  }
  return fail('字符串没闭合');
}

export function tokenizeFormula(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const str = readString(source, i);
      tokens.push({ type: 'str', value: str.value });
      i = str.next;
      continue;
    }
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(source[i + 1] || ''))) {
      const matched = NUMBER_RE.exec(source.slice(i));
      if (!matched) {
        fail(`数字写法不对：${source.slice(i, i + 8)}`);
      }
      tokens.push({ type: 'num', value: Number(matched![0]) });
      i += matched![0].length;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      const matched = IDENTIFIER_RE.exec(source.slice(i));
      if (!matched) {
        fail(`标识符写法不对：${source.slice(i, i + 8)}`);
      }
      tokens.push({ type: 'id', value: matched![0] });
      i += matched![0].length;
      continue;
    }
    const operator = OPERATORS.find((item) => source.startsWith(item, i));
    if (operator) {
      tokens.push({ type: 'op', value: operator });
      i += operator.length;
      continue;
    }
    if (PUNCTUATIONS.includes(ch)) {
      tokens.push({ type: 'punc', value: ch });
      i += 1;
      continue;
    }
    fail(`不支持的字符 ${ch}`);
  }
  return tokens;
}

function resolveIdentifier(
  name: string,
  scope: Record<string, FormulaFunction>,
): FormulaFunction | undefined {
  const segments = name.split('.');
  if (segments.length === 2) {
    if (segments[0] !== 'Math') return undefined;
    return MATH_FUNCTIONS[segments[1]];
  }
  if (segments.length === 1) {
    return scope[name];
  }
  return undefined;
}

function looseEqual(left: any, right: any): boolean {
  if (left === right) return true;
  const leftEmpty = left === null || left === undefined || left === '';
  const rightEmpty = right === null || right === undefined || right === '';
  if (leftEmpty || rightEmpty) return leftEmpty && rightEmpty;
  if (typeof left === 'number' || typeof right === 'number') {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    return !Number.isNaN(leftNumber) && !Number.isNaN(rightNumber) && leftNumber === rightNumber;
  }
  return false;
}

function compare(operator: string, left: any, right: any): boolean {
  switch (operator) {
    case '>':
      return Number(left) > Number(right);
    case '<':
      return Number(left) < Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '=':
    case '==':
      return looseEqual(left, right);
    case '===':
      return left === right;
    case '!=':
    case '<>':
      return !looseEqual(left, right);
    case '!==':
      return left !== right;
    default:
      return fail(`不支持的比较符 ${operator}`);
  }
}

class Parser {
  private index = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly scope: Record<string, FormulaFunction>,
  ) {}

  parse(): any {
    const value = this.parseCompare();
    if (this.index < this.tokens.length) {
      const token = this.tokens[this.index];
      return fail(`公式在这里多出内容：${String(token.value)}`);
    }
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private take(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      return fail('公式不完整');
    }
    this.index += 1;
    return token;
  }

  private acceptPunc(value: string): boolean {
    const token = this.peek();
    if (token && token.type === 'punc' && token.value === value) {
      this.index += 1;
      return true;
    }
    return false;
  }

  private acceptOp(values: string[]): string | undefined {
    const token = this.peek();
    if (token && token.type === 'op' && values.includes(token.value)) {
      this.index += 1;
      return token.value;
    }
    return undefined;
  }

  private parseCompare(): any {
    let left = this.parseAdd();
    for (;;) {
      const operator = this.acceptOp(['===', '!==', '>=', '<=', '==', '!=', '<>', '>', '<', '=']);
      if (!operator) return left;
      left = compare(operator, left, this.parseAdd());
    }
  }

  private parseAdd(): any {
    let left = this.parseMultiply();
    for (;;) {
      const operator = this.acceptOp(['+', '-']);
      if (!operator) return left;
      const right = this.parseMultiply();
      left = operator === '+' ? left + right : left - right;
    }
  }

  private parseMultiply(): any {
    let left = this.parseUnary();
    for (;;) {
      const operator = this.acceptOp(['*', '/', '%']);
      if (!operator) return left;
      const right = this.parseUnary();
      if (operator === '*') left *= right;
      else if (operator === '/') left /= right;
      else left %= right;
    }
  }

  private parseUnary(): any {
    const operator = this.acceptOp(['+', '-']);
    if (operator === '+') return +this.parseUnary();
    if (operator === '-') return -this.parseUnary();
    return this.parsePrimary();
  }

  private parseArguments(): any[] {
    const args: any[] = [];
    if (this.acceptPunc(')')) return args;
    for (;;) {
      args.push(this.parseCompare());
      if (this.acceptPunc(')')) return args;
      if (!this.acceptPunc(',')) {
        fail('函数参数之间少了逗号');
      }
    }
  }

  private parsePrimary(): any {
    const token = this.take();
    if (token.type === 'num' || token.type === 'str') {
      return token.value;
    }
    if (token.type === 'punc' && token.value === '(') {
      const value = this.parseCompare();
      if (!this.acceptPunc(')')) {
        fail('括号没闭合');
      }
      return value;
    }
    if (token.type === 'punc' && token.value === '[') {
      const list: any[] = [];
      if (this.acceptPunc(']')) return list;
      for (;;) {
        list.push(this.parseCompare());
        if (this.acceptPunc(']')) return list;
        if (!this.acceptPunc(',')) {
          fail('数组元素之间少了逗号');
        }
      }
    }
    if (token.type === 'id') {
      const fn = resolveIdentifier(token.value, this.scope);
      if (!fn) {
        return fail(`公式里出现了白名单之外的名称 ${token.value}`);
      }
      if (!this.acceptPunc('(')) {
        return fail(`${token.value} 后面要跟括号`);
      }
      return fn(...this.parseArguments());
    }
    return fail(`公式里出现了解释不了的内容 ${String(token.value)}`);
  }
}

/**
 * 求值一条由方案拼出来的公式。只认 scope 里的函数名、Math 白名单函数、数组/字符串/数字字面量
 * 与 + - * / % 及比较运算；夹带语句会在词法/语法阶段抛错。
 */
export function evaluateFormula(source: string, scope: Record<string, FormulaFunction>): any {
  return new Parser(tokenizeFormula(source), scope).parse();
}

/**
 * COUNTIF 的条件求值：条件形如 `>2`、`>=3`、`<5`、`=女`、`女`。
 * 不带运算符时按严格相等（与原先走 else 分支的行为一致）；带运算符时按数值比较。
 */
export function matchCountif(value: any, condition: string): boolean {
  const text = typeof condition === 'string' ? condition.trim() : String(condition ?? '');
  const matched = /^(===|!==|>=|<=|==|!=|<>|>|<|=)\s*([\s\S]*)$/.exec(text);
  if (!matched) {
    return value === condition;
  }
  const operator = matched[1];
  let operand: any = matched[2].trim();
  if (
    operand.length >= 2 &&
    ((operand.startsWith("'") && operand.endsWith("'")) ||
      (operand.startsWith('"') && operand.endsWith('"')))
  ) {
    operand = operand.slice(1, -1);
  }
  if (operand !== '' && !Number.isNaN(Number(operand))) {
    operand = Number(operand);
  }
  return compare(operator, value, operand);
}
