import { LucideFileCodeCorner } from 'lucide-react';
import styles from './EditorHeader.module.css';
import { Separator, Text } from '@radix-ui/themes';
import CurrentEditors from '../current-editors/CurrentEditors';
import { editors } from '../sampleData';
import EditorControls from '../controls/EditorControls';
import type { Document } from '../../../../features/documents/document';

interface EditorHeaderProps {
  file: Document | undefined;
}

const EditorHeader = ({ file }: EditorHeaderProps) => {
  return (
    <div className={styles.container}>
      <LucideFileCodeCorner size={20} />
      <Text size="2">{file?.name}</Text>
      <Separator orientation="vertical" />
      <EditorControls />
      <Separator orientation="vertical" />
      <CurrentEditors editors={editors} className={styles.currentEditors} />
    </div>
  );
};

export default EditorHeader;
