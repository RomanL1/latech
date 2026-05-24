import { editor as MonacoEditor, type IRange } from 'monaco-editor';
import type { RefObject } from 'react';
import * as Y from 'yjs';

export class LatexMacro {
  public readonly prefix: string;
  public readonly suffix: string;

  constructor(
    public readonly name: string,
    public readonly isolate = false,
  ) {
    this.prefix = `${isolate ? '{' : ''}\\${name}{`;
    this.suffix = `${isolate ? '}' : ''}}`;
  }

  empty(): string {
    return this.wrap('');
  }

  wrap(content: string): string {
    return `${this.prefix}${content}${this.suffix}`;
  }
}

export function toggleSurroundingMacro(
  macro: LatexMacro,
  editor: MonacoEditor.IStandaloneCodeEditor | null,
  yDoc: Y.Doc | null,
  yText: Y.Text | null,
  editorControlRef: RefObject<unknown>,
) {
  if (!editor || !yDoc || !yText) return;

  const model = editor.getModel();
  const selection = editor.getSelection();
  if (!model || !selection) return;

  const position = selection.getPosition();
  const wordAtCursor = model.getWordAtPosition(position);
  const selectedText = model.getValueInRange(selection);

  // Case: User has selected text
  if (!selection.isEmpty()) {
    const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, selection);

    // Replace surrounded macro with selected text
    if (isSurroundedByMacro) {
      const surroundingMacroStartOffset = model.getOffsetAt({
        column: surroundedMacroRange.startColumn,
        lineNumber: surroundedMacroRange.startLineNumber,
      });

      const surroundingMacroEndOffset = model.getOffsetAt({
        column: surroundedMacroRange.endColumn,
        lineNumber: surroundedMacroRange.endLineNumber,
      });

      const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;
      yDoc.transact(() => {
        yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
        yText.insert(surroundingMacroStartOffset, selectedText);
      }, editorControlRef.current);

      const cursorEndOffset = surroundingMacroStartOffset + selectedText.length;
      const cursorEndPosition = model.getPositionAt(cursorEndOffset);

      editor.setSelection({
        startColumn: surroundedMacroRange.startColumn,
        startLineNumber: surroundedMacroRange.startLineNumber,
        endColumn: cursorEndPosition.column,
        endLineNumber: cursorEndPosition.lineNumber,
      });
    }

    // Surround selected text with new macro
    else {
      const selectionStartPosition = selection.getStartPosition();
      const selectionStartOffset = model.getOffsetAt(selectionStartPosition);
      const selectionEndPosition = selection.getEndPosition();
      const selectionEndOffset = model.getOffsetAt(selectionEndPosition);

      const selectionLength = selectionEndOffset - selectionStartOffset;
      const surroundedSelection = macro.wrap(selectedText);

      yDoc.transact(() => {
        yText.delete(selectionStartOffset, selectionLength);
        yText.insert(selectionStartOffset, surroundedSelection);
      }, editorControlRef.current);

      const cursorStartOffset = selectionStartOffset + macro.prefix.length;
      const cursorStartPosition = model.getPositionAt(cursorStartOffset);
      const cursorEndOffset = selectionStartOffset + surroundedSelection.length - macro.suffix.length;
      const cursorEndPosition = model.getPositionAt(cursorEndOffset);

      editor.setSelection({
        startColumn: cursorStartPosition.column,
        startLineNumber: cursorStartPosition.lineNumber,
        endColumn: cursorEndPosition.column,
        endLineNumber: cursorEndPosition.lineNumber,
      });
    }
  }
  // Case: User has cursor on top of a word
  else if (wordAtCursor) {
    const wordRange: IRange = {
      startLineNumber: position.lineNumber,
      startColumn: wordAtCursor.startColumn,
      endLineNumber: position.lineNumber,
      endColumn: wordAtCursor.endColumn,
    };

    const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, wordRange);

    // Replace surrounding macro with word
    if (isSurroundedByMacro) {
      const surroundingMacroStartOffset = model.getOffsetAt({
        column: surroundedMacroRange.startColumn,
        lineNumber: surroundedMacroRange.startLineNumber,
      });

      const surroundingMacroEndOffset = model.getOffsetAt({
        column: surroundedMacroRange.endColumn,
        lineNumber: surroundedMacroRange.endLineNumber,
      });

      const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;

      yDoc.transact(() => {
        yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
        yText.insert(surroundingMacroStartOffset, wordAtCursor.word);
      }, editorControlRef.current);

      const cursorOffset = surroundingMacroStartOffset + wordAtCursor.word.length;
      const cursorPosition = model.getPositionAt(cursorOffset);
      editor.setPosition(cursorPosition);
    }

    // Surround the word with new macro
    else {
      const wordStartOffset = model.getOffsetAt({
        column: wordAtCursor.startColumn,
        lineNumber: position.lineNumber,
      });

      const surroundedWord = macro.wrap(wordAtCursor.word);

      yDoc.transact(() => {
        yText.delete(wordStartOffset, wordAtCursor.word.length);
        yText.insert(wordStartOffset, surroundedWord);
      }, editorControlRef.current);

      const cursorOffset = wordStartOffset + surroundedWord.length - macro.suffix.length;
      const cursorPosition = model.getPositionAt(cursorOffset);
      editor.setPosition(cursorPosition);
    }
  }
  // Case: User has cursor in free space
  else {
    const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, selection);

    // Replace surrounded macro with empty text
    if (isSurroundedByMacro) {
      const surroundingMacroStartOffset = model.getOffsetAt({
        column: surroundedMacroRange.startColumn,
        lineNumber: surroundedMacroRange.startLineNumber,
      });

      const surroundingMacroEndOffset = model.getOffsetAt({
        column: surroundedMacroRange.endColumn,
        lineNumber: surroundedMacroRange.endLineNumber,
      });

      const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;

      yDoc.transact(() => {
        yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
      }, editorControlRef.current);
    }
    // Insert empty macro at cursor position
    else {
      const positionOffset = model.getOffsetAt(position);
      const emptyMacro = macro.empty();
      yDoc.transact(() => {
        yText.insert(positionOffset, emptyMacro);
      }, editorControlRef.current);

      const cursorOffset = positionOffset + emptyMacro.length - macro.suffix.length;
      const cursorPosition = model.getPositionAt(cursorOffset);
      editor.setPosition(cursorPosition);
    }
  }
}

function isImmediatelySurroundedByMacro(
  macro: LatexMacro,
  model: MonacoEditor.ITextModel,
  selection: IRange,
): [true, IRange] | [false, null] {
  const macroPrefix = macro.prefix;
  const macroSuffix = macro.suffix;

  // Determine bounds of surrounding macro
  const selectionStartOffset = model.getOffsetAt({
    lineNumber: selection.startLineNumber,
    column: selection.startColumn,
  });

  const selectionEndOffset = model.getOffsetAt({
    lineNumber: selection.endLineNumber,
    column: selection.endColumn,
  });

  const prefixStartOffset = selectionStartOffset - macroPrefix.length;
  const suffixEndOffset = selectionEndOffset + macroSuffix.length;

  // Immediate surroundings are out of bounds of model content => not surrounded
  if (prefixStartOffset < 0 || suffixEndOffset > model.getValueLength()) {
    return [false, null];
  }

  const prefixPosition = model.getPositionAt(prefixStartOffset);
  const prefixRange: IRange = {
    startLineNumber: prefixPosition.lineNumber,
    startColumn: prefixPosition.column,
    endLineNumber: selection.startLineNumber,
    endColumn: selection.startColumn,
  };

  const suffixPosition = model.getPositionAt(suffixEndOffset);
  const suffixRange: IRange = {
    startLineNumber: selection.endLineNumber,
    startColumn: selection.endColumn,
    endLineNumber: suffixPosition.lineNumber,
    endColumn: suffixPosition.column,
  };

  // Check whether surroundings match expected macro
  const prefixMatches = model.getValueInRange(prefixRange) === macroPrefix;
  const suffixMatches = model.getValueInRange(suffixRange) === macroSuffix;
  const isSurrounded = prefixMatches && suffixMatches;

  if (!isSurrounded) {
    return [false, null];
  }

  const surroundedMacroRange: IRange = {
    startLineNumber: prefixPosition.lineNumber,
    startColumn: prefixPosition.column,
    endLineNumber: suffixPosition.lineNumber,
    endColumn: suffixPosition.column,
  };

  return [true, surroundedMacroRange];
}
