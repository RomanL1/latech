import Editor, { useMonaco } from '@monaco-editor/react';
import { ThemeContext } from '@radix-ui/themes';
import { editor as MonacoEditor } from 'monaco-editor';
import { memo, useContext, useEffect } from 'react';
import type { AwarenessUserMap } from '../../context/editor/EditorProvider';
import Cursors from './cursor/Cursors';
import styles from './LatexEditor.module.css';

interface LatexEditorProps {
  content: string;
  users: AwarenessUserMap;
  onEditorMounted: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
}

const LatexEditor = memo(
  ({ content, users, onEditorMounted }: LatexEditorProps) => {
    const monaco = useMonaco();
    const context = useContext(ThemeContext);

    useEffect(() => {
      if (!monaco) return;
      monaco.editor.setTheme(context?.appearance === 'dark' ? 'vs-dark' : 'vs-light');
    }, [monaco, context?.appearance]);

    const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
      onEditorMounted(editor);
    };

    return (
      <div className={styles.container}>
        {users.size > 0 && <Cursors awarenessUsers={users} />}
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
  },
  (prev, next) => {
    const previousUsers = [...prev.users.keys()];
    const nextUsers = [...next.users.keys()];

    return (
      prev.content === next.content &&
      prev.users.size === next.users.size &&
      previousUsers.every((user) => nextUsers.includes(user))
    );
  },
);

export default LatexEditor;
