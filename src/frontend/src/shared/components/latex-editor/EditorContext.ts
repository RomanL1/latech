import { editor as MonacoEditor } from 'monaco-editor';
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import type { LatexListStructure } from './controls/lists';
import type { LatexMacro } from './controls/single-macro';
import type { TableDimensions } from './controls/table';

export type AwarenessUser = {
  clientId: number;
  user?: {
    name?: string;
    color: string;
  };
};

export type AwarenessUserList = Map<number, AwarenessUser>;

export interface AwarenessContextValue {
  awarenessUsers: AwarenessUserList;
  currentAwarenessUser: AwarenessUser | null;
}

export interface EditorContextValue {
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  isConnected: boolean;
  setEditor: Dispatch<SetStateAction<MonacoEditor.IStandaloneCodeEditor | null>>;
  yDoc: Y.Doc | null;
  yProvider: WebsocketProvider | null;
  yText: Y.Text | null;
  undo: () => void;
  redo: () => void;
  toggleSurroundingMacro: (macro: LatexMacro) => void;
  toggleListStructure: (listStructure: LatexListStructure) => void;
  insertImage: (fileName: string) => void;
  insertTable: (dimensions: TableDimensions) => void;
  insertMathSymbol: (symbol: string) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);
export const AwarenessContext = createContext<AwarenessContextValue | null>(null);

export function useEditor() {
  const value = useContext(EditorContext);
  if (!value) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return value;
}

export function useAwareness() {
  const value = useContext(AwarenessContext);
  if (!value) {
    throw new Error('useAwareness must be used within an EditorProvider');
  }
  return value;
}
