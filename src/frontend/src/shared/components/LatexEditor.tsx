import Editor, { useMonaco } from '@monaco-editor/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { editor as MonacoEditor, KeyMod, KeyCode } from 'monaco-editor';
import { ThemeContext } from '@radix-ui/themes';

interface LatexEditorProps {
  texFile: string | undefined;
}

function LatexEditor({ texFile }: LatexEditorProps) {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const isEditorMount = useRef(false);
  const monaco = useMonaco();
  const context = useContext(ThemeContext);

  useEffect(() => {
    if (monaco) {
      const theme = context?.appearance === 'dark' ? 'vs-dark' : 'vs-light';
      monaco.editor.setTheme(theme);
      monaco.languages.register({ id: 'latex' });
      monaco.languages.setMonarchTokensProvider('latex', {
        tokenizer: {
          root: [
            [/%.*$/, 'comment'],
            [/\\[a-zA-Z]+/, 'keyword'],
            [/\$[^$]*\$/, 'string'],
          ],
        },
      });
    }

    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    console.log('Model Language: ', model.getLanguageId());

    if (isEditorMount.current) {
      console.log('Editor already mounted, skipping Yjs setup.');
      return;
    }

    console.log('after:', model.getLanguageId()); // should be "latex"

    isEditorMount.current = true;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');

    console.log('YTEXT', ytext);

    if (ytext.length === 0 && texFile) {
      ytext.insert(0, texFile);
    }

    const provider = new WebsocketProvider(window.ENV.VITE_WS_HOST, 'monaco', ydoc);
    provider.on('status', (event) => {
      console.log('Status: ' + event.status);
    });

    provider.awareness.setLocalStateField('user', {
      name: `User-${Math.floor(Math.random() * 1000)}`,
      color: '#ffb61e',
    });

    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates();
      console.log('Awareness states: ', states);
    });

    provider.on('connection-error', (event) => {
      console.error('Connection error: ', event);
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
      console.log('Undo command triggered');
      undoManager.undo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
      console.log('Redo command triggered');
      undoManager.redo();
    });

    const binding = new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);

    const undoManager = new Y.UndoManager(ytext, {
      trackedOrigins: new Set([binding]),
    });

    undoManager.on('stack-item-added', () => {
      console.log('Undo stack item added. Undo stack size: ', undoManager.undoStack.length);
    });

    return () => {
      provider.disconnect();
      ydoc.destroy();
      binding.destroy();
      provider.awareness.destroy();
      provider.destroy();
      undoManager.destroy();
    };
  }, [editor, texFile, monaco, context]);

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  return <Editor height="100%" defaultValue={texFile} defaultLanguage="latex" onMount={handleMount} />;
}

export default LatexEditor;
