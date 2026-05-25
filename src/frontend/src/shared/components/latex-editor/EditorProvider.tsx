import { generateColor } from '@marko19907/string-to-color';
import { useMonaco } from '@monaco-editor/react';
import { KeyCode, KeyMod, editor as MonacoEditor } from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { MonacoBinding } from 'y-monaco';
import * as awarenessProtocol from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { getDocument } from '../../../features/documents/api';
import { EditorContext, type AwarenessUser, type AwarenessUserList, type EditorContextValue } from './EditorContext';
import { useKeyboardSaveContext } from '../../../pages/document/provider/KeyboardSaveContext';

import * as tableControlActions from './controls/table';
import * as imageControlActions from './controls/images';
import * as listControlActions from './controls/lists';
import * as singleMacroControlActions from './controls/single-macro';
import type { TableDimensions } from './controls/table';

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
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const editorControlRef = useRef({ name: 'editor-control' });

  const undo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, []);
  const { triggerSave } = useKeyboardSaveContext();

  const toggleSurroundingMacro = useCallback(
    (macro: singleMacroControlActions.LatexMacro) => {
      singleMacroControlActions.toggleSurroundingMacro(macro, editor, yDoc, yText, editorControlRef);
    },
    [editor, yDoc, yText],
  );

  const toggleListStructure = useCallback(
    (listStructure: listControlActions.LatexListStructure) => {
      listControlActions.toggleListStructure(listStructure, editor, yDoc, yText, editorControlRef);
    },
    [editor, yDoc, yText],
  );

  const insertImage = useCallback(
    (fileName: string) => {
      imageControlActions.insertImage(fileName, editor, yDoc, yText, editorControlRef);
    },
    [editor, yDoc, yText],
  );

  const insertTable = useCallback(
    (dimensions: TableDimensions) => {
      tableControlActions.insertTable(dimensions, editor, yDoc, yText, editorControlRef);
    },
    [editor, yDoc, yText],
  );

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
      trackedOrigins: new Set([binding, editorControlRef.current]),
    });

    // Expose undo manager to the outer scope for use in undo/redo functions
    undoManagerRef.current = undoManager;

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

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      triggerSave();
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
  }, [editor, monaco, roomId, triggerSave]);

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
      undo,
      redo,
      toggleSurroundingMacro,
      toggleListStructure,
      insertImage,
      insertTable,
    }),
    [
      awarenessUsers,
      currentAwarenessUser,
      editor,
      yDoc,
      yProvider,
      yText,
      undo,
      redo,
      toggleSurroundingMacro,
      toggleListStructure,
      insertImage,
      insertTable,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
