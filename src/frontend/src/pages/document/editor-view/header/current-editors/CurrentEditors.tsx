import { Text } from '@radix-ui/themes';
import styles from './CurrentEditor.module.css';
import type { AwarenessUser, AwarenessUserList } from '../../../../../shared/components/latex-editor/LatexEditor';

interface CurrentEditorProps {
  className?: string;
  editors: AwarenessUserList;
  currentEditor?: AwarenessUser | null;
}

const CurrentEditors = ({ className = '', editors, currentEditor }: CurrentEditorProps) => {
  const editorList = Array.from(editors.values()).filter((e) => e.user);
  const otherEditorCount = editorList.length - 2;
  const filteredEditors = currentEditor ? editorList.filter((e) => e.clientId !== currentEditor.clientId) : editorList;

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
