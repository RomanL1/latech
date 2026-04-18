import { LucideFileCodeCorner, LucidePlay } from 'lucide-react';
import styles from './EditorHeader.module.css';
import type { LatexFile } from '../../sampleData';
import { Button, Separator, Spinner, Text } from '@radix-ui/themes';
import { useState } from 'react';
import CurrentEditors from '../current-editors/CurrentEditors';
import { editors } from '../sampleData';
import EditorControls from '../controls/EditorControls';

interface EditorHeaderProps {
  file: LatexFile;
}

const EditorHeader = ({ file }: EditorHeaderProps) => {
  const [isCompiling, setIsCompiling] = useState(false);

  const handleOnCompileClick = () => {
    setIsCompiling(true);
  };

  const buttonText = isCompiling ? 'Compiling' : 'Compile PDF';

  return (
    <div className={styles.container}>
      <LucideFileCodeCorner size={20} />
      <Text size="2">{file.name}</Text>
      <Separator orientation="vertical" />
      <EditorControls />
      <Separator orientation="vertical" />
      <CurrentEditors editors={editors} className={styles.currentEditors} />
      <Button disabled={isCompiling} onClick={handleOnCompileClick} size="2">
        <Spinner loading={isCompiling} />
        {!isCompiling && <LucidePlay size="19" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default EditorHeader;
