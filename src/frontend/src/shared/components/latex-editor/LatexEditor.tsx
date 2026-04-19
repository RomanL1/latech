import Editor, { useMonaco } from '@monaco-editor/react';
import { useContext, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { editor as MonacoEditor, KeyMod, KeyCode } from 'monaco-editor';
import { ThemeContext } from '@radix-ui/themes';
import Cursors from './cursor/Cursors';

interface LatexEditorProps {
  content: string | undefined;
}

function LatexEditor({ content }: LatexEditorProps) {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [yProvider, setYProvider] = useState<WebsocketProvider>();
  const monaco = useMonaco();
  const context = useContext(ThemeContext);

  useEffect(() => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const theme = context?.appearance === 'dark' ? 'vs-dark' : 'vs-light';
    monaco.editor.setTheme(theme);

    const yDoc = new Y.Doc();
    const yText = yDoc.getText('monaco');
    if (content && content.length === 0) yText.insert(0, content);

    const yProvider = new WebsocketProvider(window.ENV.VITE_WS_HOST, 'monaco', yDoc);

    setYProvider(yProvider);

    const binding = new MonacoBinding(yText, model, new Set([editor]), yProvider.awareness);
    const undoManager = new Y.UndoManager(yText, {
      trackedOrigins: new Set([binding]),
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
      undoManager.undo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
      undoManager.redo();
    });

    return () => {
      yProvider.destroy();
      yDoc.destroy();
      undoManager.destroy();
    };
  }, [content, editor, monaco, context]);

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  return (
    <>
      {yProvider ? <Cursors yProvider={yProvider} /> : null}
      <Editor height="100%" defaultValue={content} defaultLanguage="latex" onMount={handleMount} />
    </>
  );
}

export default LatexEditor;
