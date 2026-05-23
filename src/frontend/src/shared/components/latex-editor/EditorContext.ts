import { editor as MonacoEditor } from 'monaco-editor';
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export type AwarenessUser = {
  clientId: number;
  user?: {
    name?: string;
    color: string;
  };
};

export type AwarenessUserList = Map<number, AwarenessUser>;

export interface EditorContextValue {
  awarenessUsers: AwarenessUserList;
  currentAwarenessUser: AwarenessUser | null;
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  isConnected: boolean;
  setEditor: Dispatch<SetStateAction<MonacoEditor.IStandaloneCodeEditor | null>>;
  yDoc: Y.Doc | null;
  yProvider: WebsocketProvider | null;
  yText: Y.Text | null;
  undo: () => void;
  redo: () => void;
  surroundSelectionOrWord: (prefix: string, suffix?: string) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const value = useContext(EditorContext);

  if (!value) {
    throw new Error('useEditor must be used within an EditorProvider');
  }

  return value;
}
