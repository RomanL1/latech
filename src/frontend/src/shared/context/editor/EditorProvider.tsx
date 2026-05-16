import { generateColor } from '@marko19907/string-to-color';
import { KeyCode, KeyMod, editor as monaco } from 'monaco-editor';
import type { PropsWithChildren } from 'react';
import { useCallback, useState, type EffectCallback } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { MonacoBinding } from 'y-monaco';
import { Awareness, removeAwarenessStates } from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import { Doc, UndoManager } from 'yjs';
import { EditorContext } from './context';

type MonacoEditor = monaco.IStandaloneCodeEditor;

export interface EditorService {
  isInitialized: boolean;
  currentUser: AwarenessUser | null;
  users: AwarenessUserMap;

  init: (editor: MonacoEditor) => void;
  joinRoom: (roomId: string, initialContent: string) => EffectCallback;
}

export type AwarenessUser = {
  clientId: number;
  user?: {
    name?: string;
    color: string;
  };
};

export type AwarenessUserMap = Map<number, AwarenessUser>;

export function EditorProvider({ children }: PropsWithChildren) {
  const [monacoEditor, setMonacoEditor] = useState<MonacoEditor | null>(null);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUserMap>(new Map());
  const [currentAwarenessUser, setCurrentAwarenessUser] = useState<AwarenessUser | null>(null);

  const editorService: EditorService = {
    isInitialized: Boolean(monacoEditor),
    users: awarenessUsers,
    currentUser: currentAwarenessUser,

    init: useCallback((editor) => setMonacoEditor(editor), [setMonacoEditor]),
    joinRoom: (roomId: string, initialContent: string) => {
      const model = monacoEditor?.getModel();
      if (!monacoEditor || !model) return () => {};

      // Connect to Yjs document
      const yDoc = new Doc();
      const yText = yDoc.getText('latech');
      const yProvider = new WebsocketProvider(window.ENV.VITE_WS_HOST, roomId, yDoc);

      // Initialize the editor content with the provided content if the Yjs document is empty
      yProvider.on('sync', (isSynced) => {
        if (isSynced && yText.toString().length === 0 && initialContent) {
          yText.insert(0, initialContent);
        }
      });

      // Setup undo/redo commands
      const binding = new MonacoBinding(yText, model, new Set([monacoEditor]), yProvider.awareness);
      const undoManager = new UndoManager(yText, {
        trackedOrigins: new Set([binding]),
      });
      monacoEditor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
        undoManager.undo();
      });

      monacoEditor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
        undoManager.redo();
      });

      // Cursor positioning
      const currentUserId = yDoc.clientID;
      const awareness = yProvider.awareness;
      const cleanupAwarenessStates = () => {
        removeAwarenessStates(awareness, [currentUserId], 'window unload');
      };
      window.addEventListener('beforeunload', cleanupAwarenessStates);

      const awarenessUser = getAwarenessUserInfo(yProvider.awareness);
      awareness.setLocalStateField('user', awarenessUser);

      const setupAwarenessUsers = () => {
        const allUsers = getActiveAwarenessUsers(awareness);

        setAwarenessUsers(allUsers);
        setCurrentAwarenessUser(allUsers.get(currentUserId) || null);
      };

      awareness.on('change', setupAwarenessUsers);
      setupAwarenessUsers();

      // Cleanup function
      return () => {
        binding.destroy();
        awareness.destroy();
        yProvider.destroy();
        yDoc.destroy();
        undoManager.destroy();
        window.removeEventListener('beforeunload', cleanupAwarenessStates);
        awareness.off('change', setupAwarenessUsers);
      };
    },
  };

  function getActiveAwarenessUsers(awareness: Awareness): AwarenessUserMap {
    return new Map(
      Array.from(awareness.getStates().entries()).map(([clientId, state]) => [
        clientId,
        {
          clientId,
          user: state.user,
        },
      ]),
    );
  }

  function getAwarenessUserInfo(awareness: Awareness) {
    let name = sessionStorage.getItem('latech-username') || '';
    let color = sessionStorage.getItem('latech-usercolor') || '';

    if (name && color && Array.from(awareness.getStates().values()).some((state) => state.user?.name === name)) {
      name = '';
      color = '';
    }

    if (!name || !color) {
      const MAX_NAME_GENERATION_ATTEMPTS = 20;

      const usedNames = new Set(
        Array.from(awareness.getStates().values())
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

      return { name, color };
    }
  }

  return <EditorContext.Provider value={editorService}>{children}</EditorContext.Provider>;
}
