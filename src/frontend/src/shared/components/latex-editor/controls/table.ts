import { editor as MonacoEditor } from 'monaco-editor';
import type { RefObject } from 'react';
import * as Y from 'yjs';

export interface TableDimensions {
  rows: number;
  columns: number;
}

export function insertTable(
  dimensions: TableDimensions,
  editor: MonacoEditor.IStandaloneCodeEditor | null,
  yDoc: Y.Doc | null,
  yText: Y.Text | null,
  editorControlRef: RefObject<unknown>,
) {
  if (!editor || !yDoc || !yText) return;

  const model = editor.getModel();
  const position = editor.getPosition();

  if (!model || !position) return;

  const indentation = ' '.repeat(position.column - 1);

  const columnLayout = getColumnLayout(dimensions.columns);
  const beginMacro = `\\begin{tabular}{${columnLayout}}\n`;
  const rows = getRows(dimensions, indentation);
  const endMacro = `${indentation}\\end{tabular}`;

  const tableContent = `${beginMacro}${rows}${endMacro}`;
  const tableOffset = model.getOffsetAt(position);

  yDoc.transact(() => {
    yText.insert(tableOffset, tableContent);
  }, editorControlRef.current);
}

function getColumnLayout(columns: number): string {
  return '|' + Array(columns).fill('c').join('|') + '|';
}

function getRows({ rows, columns }: TableDimensions, indentation: string) {
  const rowCells =
    Array(rows - 1)
      .fill(' & ')
      .join('') + '\\\\';

  return (
    Array.from({ length: columns })
      .map(() => `${indentation}\\hline\n${indentation}${rowCells}\n`)
      .join('') + `${indentation}\\hline\n`
  );
}
