import Editor, { type Monaco } from '@monaco-editor/react';
import { editor as MonacoEditor } from 'monaco-editor';
import Cursors from './cursor/Cursors';
import { useEditor } from './EditorContext';
import styles from './LatexEditor.module.css';
import { shikiToMonaco } from '@shikijs/monaco';
import { createHighlighter } from 'shiki';

interface LatexEditorProps {
  content: string;
}

function LatexEditor({ content }: LatexEditorProps) {
  const { isConnected, setEditor } = useEditor();

  const handleMount = async (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditor(editor);

    monaco.languages.register({ id: 'latex' });

    const highlighter = await createHighlighter({
      themes: ['vitesse-dark'],
      langs: ['latex'],
    });

    shikiToMonaco(highlighter, monaco);
  };

  return (
    <div className={styles.container}>
      {isConnected && <Cursors />}
      <Editor
        height="100%"
        defaultValue={content}
        language="latex"
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}

export default LatexEditor;
