import Editor from '@monaco-editor/react';
import { editor as MonacoEditor } from 'monaco-editor';
import Cursors from './cursor/Cursors';
import { useEditor } from './EditorContext';
import styles from './LatexEditor.module.css';

interface LatexEditorProps {
  content: string;
}

function LatexEditor({ content }: LatexEditorProps) {
  const { awarenessUsers, isConnected, setEditor } = useEditor();

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  return (
    <div className={styles.container}>
      {isConnected && <Cursors awarenessUsers={awarenessUsers} />}
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
