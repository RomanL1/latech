import { useMonaco } from '@monaco-editor/react';
import { generateColor } from '@marko19907/string-to-color';
import { ThemeContext } from '@radix-ui/themes';
import { editor as MonacoEditor, KeyCode, KeyMod } from 'monaco-editor';
import { type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { MonacoBinding } from 'y-monaco';
import * as awarenessProtocol from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { getDocument } from '../../../features/documents/api';
import { EditorContext, type AwarenessUser, type AwarenessUserList, type EditorContextValue } from './EditorContext';

interface EditorProviderProps {
  children: ReactNode;
  roomId: string;
}

export function EditorProvider({ children, roomId }: EditorProviderProps) {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [yProvider, setYProvider] = useState<WebsocketProvider | null>(null);
  const [yText, setYText] = useState<Y.Text | null>(null);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUserList>(new Map());
  const [currentAwarenessUser, setCurrentAwarenessUser] = useState<AwarenessUser | null>(null);
  const monaco = useMonaco();
  const context = useContext(ThemeContext);

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.setTheme(context?.appearance === 'dark' ? 'vs-dark' : 'vs-light');
  }, [monaco, context?.appearance]);

  useEffect(() => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    // Force LF line endings for Yjs synchronisation.
    model.setEOL(monaco.editor.EndOfLineSequence.LF);

    const doc = new Y.Doc();
    const text = doc.getText('latech');
    const provider = new WebsocketProvider(window.ENV.VITE_WS_HOST, roomId, doc);

    let isActive = true;

    Promise.resolve().then(() => {
      if (!isActive) return;
      setYDoc(doc);
      setYText(text);
      setYProvider(provider);
    });

    const binding = new MonacoBinding(text, model, new Set([editor]), provider.awareness);
    const undoManager = new Y.UndoManager(text, {
      trackedOrigins: new Set([binding]),
    });

    provider.on('sync', async (isSynced: boolean) => {
      if (!isSynced) return;
      const current = text.toString();
      if (current.length === 0) {
        const fresh = await getDocument(roomId);
        const freshText = fresh.content?.replace(/\r\n/g, '\n') ?? '';
        if (freshText) text.insert(0, freshText);
      } else if (current.includes('\r\n')) {
        doc.transact(() => {
          text.delete(0, current.length);
          text.insert(0, current.replace(/\r\n/g, '\n'));
        });
      }
      model.setEOL(monaco.editor.EndOfLineSequence.LF);
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
      Array.from(provider.awareness.getStates().values()).some((state) => state.user?.name === name)
    ) {
      name = '';
      color = '';
    }

    if (!name || !color) {
      const MAX_NAME_GENERATION_ATTEMPTS = 20;

      const usedNames = new Set(
        Array.from(provider.awareness.getStates().values())
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

    const handleWindowUnload = () => {
      awarenessProtocol.removeAwarenessStates(provider.awareness, [provider.doc.clientID], 'window unload');
    };

    window.addEventListener('beforeunload', handleWindowUnload);

    provider.awareness.setLocalStateField('user', {
      name,
      color,
    });

    return () => {
      isActive = false;
      binding.destroy();
      provider.awareness.destroy();
      provider.destroy();
      doc.destroy();
      undoManager.destroy();
      setYDoc(null);
      setYProvider(null);
      setYText(null);
      setAwarenessUsers(new Map());
      setCurrentAwarenessUser(null);
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [editor, monaco, roomId]);

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
      setCurrentAwarenessUser(users.get(yProvider!.awareness.clientID) || null);
    }

    setUsers();

    yProvider.awareness.on('change', setUsers);

    return () => {
      yProvider.awareness.off('change', setUsers);
    };
  }, [yProvider]);

  const value = useMemo<EditorContextValue>(
    () => ({
      awarenessUsers,
      currentAwarenessUser,
      editor,
      isConnected: Boolean(yProvider),
      setEditor,
      yDoc,
      yProvider,
      yText,
    }),
    [awarenessUsers, currentAwarenessUser, editor, yDoc, yProvider, yText],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
