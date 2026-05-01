import Editor, { useMonaco } from '@monaco-editor/react';
import { useContext, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { editor as MonacoEditor, KeyMod, KeyCode } from 'monaco-editor';
import { ThemeContext } from '@radix-ui/themes';
import Cursors from './cursor/Cursors';
import { generateColor } from '@marko19907/string-to-color';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import styles from './LatexEditor.module.css';

export type AwarenessUser = {
  clientId: number;
  user?: {
    name?: string;
    color: string;
  };
};

export type AwarenessUserList = Map<number, AwarenessUser>;

interface LatexEditorProps {
  content: string;
  roomId: string;
  onAwarenessChange?: (users: AwarenessUserList) => void;
  onCurrentAwarenessChange?: (user: AwarenessUser | null) => void;
}

function LatexEditor({ content, roomId, onAwarenessChange, onCurrentAwarenessChange }: LatexEditorProps) {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [yProvider, setYProvider] = useState<WebsocketProvider>();
  const monaco = useMonaco();
  const context = useContext(ThemeContext);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUserList>(new Map());

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.setTheme(context?.appearance === 'dark' ? 'vs-dark' : 'vs-light');
  }, [monaco, context?.appearance, editor]);

  useEffect(() => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const theme = context?.appearance === 'dark' ? 'vs-dark' : 'vs-light';
    monaco.editor.setTheme(theme);

    // Force LF line endings for Yjs synchronisation
    model.setEOL(monaco.editor.EndOfLineSequence.LF);

    const yDoc = new Y.Doc();
    const yText = yDoc.getText('latech');

    const yProvider = new WebsocketProvider(window.ENV.VITE_WS_HOST, roomId, yDoc);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYProvider(yProvider);

    const binding = new MonacoBinding(yText, model, new Set([editor]), yProvider.awareness);
    const undoManager = new Y.UndoManager(yText, {
      trackedOrigins: new Set([binding]),
    });

    // Initialize the editor content with the provided content if the Yjs document is empty
    yProvider.on('sync', (isSynced) => {
      if (isSynced && yText.toString().length === 0 && content) {
        // Ensure inserted content only uses LF
        yText.insert(0, content.replace(/\r\n/g, '\n'));
      }
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
      undoManager.undo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
      undoManager.redo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyC, () => {
      editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
    });

    let name = sessionStorage.getItem('latech-username') || '';
    let color = sessionStorage.getItem('latech-usercolor') || '';

    if (
      name &&
      color &&
      Array.from(yProvider.awareness.getStates().values()).some((state) => state.user?.name === name)
    ) {
      name = '';
      color = '';
    }

    if (!name || !color) {
      const MAX_NAME_GENERATION_ATTEMPTS = 20;

      const usedNames = new Set(
        Array.from(yProvider.awareness.getStates().values())
          .map((state) => state.user?.name)
          .filter((stateName): stateName is string => Boolean(stateName)),
      );

      let generatedName = '';
      for (let attempt = 0; attempt < MAX_NAME_GENERATION_ATTEMPTS; attempt++) {
        const candidateName = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          style: 'capital',
        });

        if (!usedNames.has(candidateName)) {
          generatedName = candidateName;
          break;
        }
      }

      if (!generatedName) {
        const fallbackBaseName = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          style: 'capital',
        });
        const fallbackSuffix = Math.random().toString(36).slice(2, 8);
        generatedName = `${fallbackBaseName}${fallbackSuffix}`;
      }

      name = generatedName;
      color = generateColor(name);
      sessionStorage.setItem('latech-username', name);
      sessionStorage.setItem('latech-usercolor', color);
    }

    // Clean up awareness state on window unload
    const handleWindowUnload = () => {
      awarenessProtocol.removeAwarenessStates(yProvider.awareness, [yProvider.doc.clientID], 'window unload');
    };

    window.addEventListener('beforeunload', handleWindowUnload);

    yProvider.awareness.setLocalStateField('user', {
      name: name,
      color: color,
    });

    return () => {
      binding.destroy();
      yProvider.awareness.destroy();
      yProvider.destroy();
      yDoc.destroy();
      undoManager.destroy();
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [editor, monaco, roomId, content, onAwarenessChange, onCurrentAwarenessChange]);

  useEffect(() => {
    if (!yProvider) return;

    function setUsers() {
      const users: AwarenessUserList = new Map(
        Array.from(yProvider!.awareness.getStates().entries()).map(([clientId, state]) => [
          clientId,
          {
            clientId,
            user: state.user,
          },
        ]),
      );

      setAwarenessUsers(users);
      onAwarenessChange?.(users);
      onCurrentAwarenessChange?.(users.get(yProvider!.awareness.clientID) || null);
    }

    setUsers();

    yProvider.awareness.on('change', setUsers);

    return () => {
      yProvider.awareness.off('change', setUsers);
    };
  }, [yProvider, onAwarenessChange, onCurrentAwarenessChange]);

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  return (
    <div className={styles.container}>
      {yProvider && <Cursors awarenessUsers={awarenessUsers} />}
      <Editor
        height="100%"
        defaultValue={content}
        defaultLanguage="latex"
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}

export default LatexEditor;
