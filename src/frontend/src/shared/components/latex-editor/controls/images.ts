import { editor as MonacoEditor } from 'monaco-editor';
import type { RefObject } from 'react';
import * as Y from 'yjs';

export function insertImage(
  fileName: string,
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

  const content =
    `\\begin{figure}[h]\n` +
    `${indentation}\t\\centering\n` +
    `${indentation}\t\\includegraphics{${fileName}}\n` +
    `${indentation}\t\\caption{${fileName}}\n` +
    `${indentation}\\end{figure}`;

  const imageOffset = model.getOffsetAt(position);

  yDoc.transact(() => {
    yText.insert(imageOffset, content);
  }, editorControlRef.current);
}
