import type { editor as MonacoEditor, Position } from 'monaco-editor';
import type { RefObject } from 'react';
import * as Y from 'yjs';

export function insertSymbol(
  symbol: string,
  editor: MonacoEditor.IStandaloneCodeEditor | null,
  yDoc: Y.Doc | null,
  yText: Y.Text | null,
  editorControlRef: RefObject<unknown>,
) {
  if (!editor || !yDoc || !yText) return;

  const model = editor.getModel();
  const position = editor.getPosition();

  if (!model || !position) return;

  const isMathMode = isWithinMathMode(model, position);
  console.log(isMathMode);
  const content = isMathMode ? symbol : `$${symbol}$`;
  const offset = model.getOffsetAt(position);

  yDoc.transact(() => {
    yText.insert(offset, content);
  }, editorControlRef.current);
}

interface MathDelimiter {
  readonly opening: string;
  readonly closing: string;
}

interface MathToken {
  readonly delimiter: MathDelimiter;
  readonly offset: number;
  readonly type: 'opening' | 'closing';
}

interface MathScope {
  readonly openingToken: MathToken;
  readonly closingToken: MathToken;
}

const mathDelimiters: MathDelimiter[] = [
  { opening: '$', closing: '$' },
  { opening: '$$', closing: '$$' },
  { opening: '\\[', closing: '\\]' },
  { opening: '\\begin{equation}', closing: '\\end{equation}' },
];

const mathDelimiterTokens = mathDelimiters
  .flatMap((delimiter) => [
    { value: delimiter.opening, delimiter, type: 'opening' as const },
    { value: delimiter.closing, delimiter, type: 'closing' as const },
  ])
  .sort((left, right) => right.value.length - left.value.length);

export function isWithinMathMode(model: MonacoEditor.ITextModel, position: Position): boolean {
  const cursorOffset = model.getOffsetAt(position);
  return findMathScopeAtOffset(model.getValue(), cursorOffset) !== null;
}

function findMathScopeAtOffset(content: string, cursorOffset: number): MathScope | null {
  const delimiterStack: MathToken[] = [];
  let searchOffset = 0;

  while (searchOffset < content.length) {
    const token = findMathTokenAtOffset(content, searchOffset, delimiterStack);

    if (!token) {
      searchOffset++;
      continue;
    }

    if (token.type === 'opening') {
      delimiterStack.push(token);
      searchOffset += token.delimiter.opening.length;
      continue;
    }

    const openingToken = delimiterStack.at(-1);
    if (openingToken?.delimiter === token.delimiter) {
      delimiterStack.pop();

      if (openingToken.offset < cursorOffset && cursorOffset <= token.offset) {
        return {
          openingToken,
          closingToken: token,
        };
      }
    }

    searchOffset += token.delimiter.closing.length;
  }

  return null;
}

function findMathTokenAtOffset(content: string, offset: number, delimiterStack: MathToken[]): MathToken | null {
  for (const tokenDefinition of mathDelimiterTokens) {
    if (!content.startsWith(tokenDefinition.value, offset)) {
      continue;
    }

    const tokenType = resolveTokenType(tokenDefinition, delimiterStack);
    if (!tokenType) {
      continue;
    }

    return {
      delimiter: tokenDefinition.delimiter,
      offset,
      type: tokenType,
    };
  }

  return null;
}

function resolveTokenType(
  tokenDefinition: (typeof mathDelimiterTokens)[number],
  delimiterStack: MathToken[],
): MathToken['type'] | null {
  const latestOpeningToken = delimiterStack.at(-1);

  if (tokenDefinition.delimiter.opening === tokenDefinition.delimiter.closing) {
    return latestOpeningToken?.delimiter === tokenDefinition.delimiter ? 'closing' : 'opening';
  }

  if (tokenDefinition.type === 'opening') {
    return 'opening';
  }

  if (latestOpeningToken?.delimiter === tokenDefinition.delimiter) {
    return 'closing';
  }

  return null;
}
