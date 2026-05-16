import Editor, { useMonaco } from '@monaco-editor/react';
import { ThemeContext } from '@radix-ui/themes';
import { editor as MonacoEditor } from 'monaco-editor';
import { useContext, useEffect } from 'react';
import { useEditorService } from '../../context/editor';
import Cursors from './cursor/Cursors';
import styles from './LatexEditor.module.css';

interface LatexEditorProps {
  content: string;
  roomId: string;
}

function LatexEditor({ content, roomId }: LatexEditorProps) {
  const monaco = useMonaco();
  const editorService = useEditorService();

  const context = useContext(ThemeContext);

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(context?.appearance === 'dark' ? 'vs-dark' : 'vs-light');
  }, [editorService.isInitialized, monaco, context?.appearance]);

  useEffect(() => {
    if (editorService.isInitialized) {
      editorService.joinRoom(roomId, content);
    }
  }, [editorService.isInitialized, roomId, content]);

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    editorService.init(editor);
  };

  return (
    <div className={styles.container}>
      {editorService.users.size > 0 && <Cursors awarenessUsers={editorService.users} />}
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
