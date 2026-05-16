import { Text } from '@radix-ui/themes';
import styles from './CurrentEditor.module.css';
import { useEditorService } from '../../../../../shared/context/editor';

interface CurrentEditorProps {
  className?: string;
}

const CurrentEditors = ({ className = '' }: CurrentEditorProps) => {
  const { users, currentUser } = useEditorService();

  const editorList = Array.from(users.values()).filter((e) => e.user);
  const otherEditorCount = editorList.length - 2;
  const filteredEditors = currentUser ? editorList.filter((e) => e.clientId !== currentUser.clientId) : editorList;

  return (
    <div className={`${className} ${styles.container}`}>
      {filteredEditors.slice(0, 2).map((editor) => (
        <EditorAvatar key={editor.clientId} name={editor.user!.name ?? 'User'} color={editor.user!.color} />
      ))}

      {filteredEditors.length > 2 && <EditorAvatar name={`+${otherEditorCount - 1}`} color={'var(--gray-8)'} isCount />}
    </div>
  );
};

interface EditorAvatarTextProps {
  editorName: string;
}

const EditorAvatarText = ({ editorName }: EditorAvatarTextProps) => {
  return <Text size="2">{editorName}</Text>;
};

interface EditorAvatarProps {
  name: string;
  color: string;
  className?: string;
  isCount?: boolean;
}

const EditorAvatar = ({ name, color, isCount = false }: EditorAvatarProps) => {
  return (
    <div className={styles.avatar} style={{ backgroundColor: color }}>
      <EditorAvatarText editorName={isCount ? name : name[0]} />
    </div>
  );
};

export default CurrentEditors;
