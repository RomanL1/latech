import { editor as MonacoEditor, type IRange } from 'monaco-editor';
import type { RefObject } from 'react';
import * as Y from 'yjs';

export type LatexListType = 'itemize' | 'enumerate';
export class LatexListStructure {
  public readonly beginMacro: string;
  public readonly endMacro: string;

  constructor(type: LatexListType) {
    this.beginMacro = `\\begin{${type}}`;
    this.endMacro = `\\end{${type}}`;
  }

  build(startingColumn: number, items: string[]): string {
    const baseIndent = ' '.repeat(startingColumn - 1);

    const beginMacro = `${this.beginMacro}\n`;
    const itemMacros = items.map((item) => `${baseIndent}\t\\item ${item}\n`).join('');
    const endMacro = `${baseIndent}${this.endMacro}`;

    return `${beginMacro}${itemMacros}${endMacro}`;
  }
}

export function toggleListStructure(
  listStructure: LatexListStructure,
  editor: MonacoEditor.IStandaloneCodeEditor | null,
  yDoc: Y.Doc | null,
  yText: Y.Text | null,
  editorControlRef: RefObject<unknown>,
) {
  if (!editor || !yDoc || !yText) return;

  const model = editor.getModel();
  const selection = editor.getSelection();
  if (!model || !selection) return;

  const [isWithinList, listStructureRange] = isInsideListStructure(listStructure, model, selection);

  // Replace list structure with just the item contents
  if (isWithinList) {
    const itemContents = extractListItemContents(listStructureRange, model);

    const listStructureStartOffset = model.getOffsetAt({
      column: listStructureRange.startColumn,
      lineNumber: listStructureRange.startLineNumber,
    });

    const listStructureEndOffset = model.getOffsetAt({
      column: listStructureRange.endColumn,
      lineNumber: listStructureRange.endLineNumber,
    });

    const listStructureLength = listStructureEndOffset - listStructureStartOffset;

    const indentation = ' '.repeat(listStructureRange.startColumn - 1);
    const itemsText = itemContents
      .map((item) => `${indentation}${item}`)
      .join('\n')
      .trimStart();

    yDoc.transact(() => {
      // Remove list structure
      yText.delete(listStructureStartOffset, listStructureLength);

      // Insert item contents as plain text
      yText.insert(listStructureStartOffset, itemsText);
    }, editorControlRef.current);
  }
  // Surround the selected lines with a list structure,
  // with each selected line as its own item
  else {
    const selectedLines = extractSelectedLines(selection, model);

    // Define positions where to insert list
    const startLineNumber = selection.startLineNumber;
    const startColumn = model.getLineFirstNonWhitespaceColumn(selection.startLineNumber) || selection.startColumn;

    // Define positions of previous to delete
    const deletionStartOffset = model.getOffsetAt({
      lineNumber: startLineNumber,
      column: startColumn,
    });
    const deletionEndOffset = model.getOffsetAt({
      lineNumber: selection.endLineNumber,
      column: model.getLineLastNonWhitespaceColumn(selection.endLineNumber) || selection.endColumn,
    });
    const deletionLength = deletionEndOffset - deletionStartOffset;

    const listStartOffset = model.getOffsetAt({
      lineNumber: startLineNumber,
      column: startColumn,
    });

    const listContent = listStructure.build(startColumn, selectedLines);
    const lines = listContent.split('\n');
    const listEndPosition = {
      lineNumber: startLineNumber + lines.length - 1,
      column: lines[lines.length - 1].length + 1,
    };

    const lastListItemLineNumber = listEndPosition.lineNumber - 1;

    yDoc.transact(() => {
      // Remove selected lines
      yText.delete(deletionStartOffset, deletionLength);

      // Insert list structure
      yText.insert(listStartOffset, listContent);
    }, editorControlRef.current);

    const cursorPosition = {
      lineNumber: lastListItemLineNumber,
      column: model.getLineMaxColumn(lastListItemLineNumber),
    };

    editor.setPosition(cursorPosition);
  }
}

/** Determine whether or not a selected range is withing a list structure */
function isInsideListStructure(
  listStructure: LatexListStructure,
  model: MonacoEditor.ITextModel,
  selection: IRange,
): [true, IRange] | [false, null] {
  const selectionStartOffset = model.getOffsetAt({
    column: selection.startColumn,
    lineNumber: selection.startLineNumber,
  });

  const selectionEndOffset = model.getOffsetAt({
    column: selection.endColumn,
    lineNumber: selection.endLineNumber,
  });

  const selectionStartPosition = model.getPositionAt(selectionStartOffset);
  const selectionEndPosition = model.getPositionAt(selectionEndOffset);

  const beginMacro = listStructure.beginMacro;
  const endMacro = listStructure.endMacro;

  const beginMacroMatch = model.findPreviousMatch(beginMacro, selectionStartPosition, false, true, null, true);
  const endMacroMatch = model.findNextMatch(endMacro, selectionEndPosition, false, true, null, true);

  // No list structure macros found
  if (!beginMacroMatch || !endMacroMatch) {
    return [false, null];
  }

  const beginMacroStartOffset = model.getOffsetAt({
    column: beginMacroMatch.range.startColumn,
    lineNumber: beginMacroMatch.range.startLineNumber,
  });

  const endMacroEndOffset = model.getOffsetAt({
    column: endMacroMatch.range.endColumn,
    lineNumber: endMacroMatch.range.endLineNumber,
  });

  // Potential intercepting macros (e.g end macros between begin macro and selection)
  const precedingEndMacroMatch = model.findPreviousMatch(endMacro, selectionStartPosition, false, true, null, true);
  const succeedingBeginMacroMatch = model.findNextMatch(beginMacro, selectionEndPosition, false, true, null, true);

  const precedingEndMacroEndOffset = precedingEndMacroMatch
    ? model.getOffsetAt({
        column: precedingEndMacroMatch.range.endColumn,
        lineNumber: precedingEndMacroMatch.range.endLineNumber,
      })
    : -1;

  const succeedingBeginMacroStartOffset = succeedingBeginMacroMatch
    ? model.getOffsetAt({
        column: succeedingBeginMacroMatch.range.startColumn,
        lineNumber: succeedingBeginMacroMatch.range.startLineNumber,
      })
    : Infinity;

  // `findPreviousMatch` and `findNextMatch` loop to the opposite side of
  // the model. To account for false-positives, check whether list structure macros
  // are on the correct side relative to the selected range, without being intercepte
  // by other macros between selection and start/end macros
  const isBeginMacroInterceptedBeforeSelection =
    precedingEndMacroEndOffset < selectionStartOffset && beginMacroStartOffset < precedingEndMacroEndOffset;
  const isBeginMacroBeforeSelection = beginMacroStartOffset <= selectionStartOffset;

  const isEndMacroInterceptedAfterSelection =
    succeedingBeginMacroStartOffset > selectionEndOffset && endMacroEndOffset > succeedingBeginMacroStartOffset;
  const isEndMacroAfterSelection = endMacroEndOffset >= selectionEndOffset;

  const isValidBeginMacro = !isBeginMacroInterceptedBeforeSelection && isBeginMacroBeforeSelection;
  const isValidEndMacro = !isEndMacroInterceptedAfterSelection && isEndMacroAfterSelection;

  const isWithinListStructure = isValidBeginMacro && isValidEndMacro;

  if (!isWithinListStructure) {
    return [false, null];
  }

  const listStructureRange: IRange = {
    startColumn: beginMacroMatch.range.startColumn,
    startLineNumber: beginMacroMatch.range.startLineNumber,
    endColumn: endMacroMatch.range.endColumn,
    endLineNumber: endMacroMatch.range.endLineNumber,
  };

  return [true, listStructureRange];
}

/** Extract the contents of \item macros inside a range */
function extractListItemContents(listStructureContentRange: IRange, model: MonacoEditor.ITextModel): string[] {
  const content = model.getValueInRange(listStructureContentRange);
  const itemContentRegex = /(?<=\\item(?:\{|[^\S\r\n]+))([^\r\n}]*?)(?=\}|[^\S\r\n]*\\item|\r?\n)/g;

  const matches = [...content.matchAll(itemContentRegex)].map((match) => match[1]);
  return matches.map((line) => line.replace('\n', ''));
}

/** Extract whole line for all lines touched by a selection */
function extractSelectedLines(selection: IRange, model: MonacoEditor.ITextModel): string[] {
  const { startLineNumber, endLineNumber } = selection;
  const totalNumberOfLines = endLineNumber - startLineNumber + 1;

  const lineNumbersInRange = Array.from({ length: totalNumberOfLines }, (_, index) => startLineNumber + index);
  return lineNumbersInRange.map((lineNumber) => model.getLineContent(lineNumber).trim());
}
