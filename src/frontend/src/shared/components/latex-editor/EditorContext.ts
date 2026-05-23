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
  toggleSurroundingMacro: (macro: LatexMacro) => void;
}

export class LatexMacro {
  public readonly prefix: string;
  public readonly suffix: string;

  constructor(
    public readonly name: string,
    public readonly isolate = false,
  ) {
    this.prefix = `${isolate ? '{' : ''}\\${name}{`;
    this.suffix = `${isolate ? '}' : ''}}`;
  }

  empty(): string {
    return this.wrap('');
  }

  wrap(content: string): string {
    return `${this.prefix}${content}${this.suffix}`;
  }
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const value = useContext(EditorContext);

  if (!value) {
    throw new Error('useEditor must be used within an EditorProvider');
  }

  return value;
}
