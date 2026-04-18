import { Avatar, Text } from '@radix-ui/themes';
import styles from './CurrentEditor.module.css';
import type { ActiveEditor } from '../sampleData';

interface CurrentEditorProps {
  className?: string;
  editors: ActiveEditor[];
}

const CurrentEditors = ({ className = '', editors }: CurrentEditorProps) => {
  const otherEditorCount = editors.length - 2;

  return (
    <div className={`${className} ${styles.container}`}>
      {editors.slice(0, 2).map((editor) => (
        <Avatar
          size="2"
          key={editor.id}
          fallback={<EditorAvatarText editorName={editor.name[0]} />}
          radius="full"
          className={styles.avatar}
          variant="solid"
          // TODO: umbauen
          color={editor.color}
        />
      ))}

      {editors.length > 2 && (
        <Avatar
          size="2"
          fallback={<EditorAvatarText editorName={'+' + otherEditorCount} />}
          radius="full"
          className={styles.avatar}
          variant="solid"
          color="gray"
        />
      )}
    </div>
  );
};

interface EditorAvatarProps {
  editorName: string;
}

const EditorAvatarText = ({ editorName }: EditorAvatarProps) => {
  return <Text size="1">{editorName}</Text>;
};

export default CurrentEditors;
