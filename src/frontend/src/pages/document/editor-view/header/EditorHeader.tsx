import { LucideFileCodeCorner, LucidePlay } from 'lucide-react';
import styles from './EditorHeader.module.css';
import type { LatexFile } from '../../sampleData';
import { Button, Spinner, Text } from '@radix-ui/themes';
import { useState } from 'react';
import CurrentEditors from '../current-editors/CurrentEditors';
import { editors } from '../sampleData';

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
      <LucideFileCodeCorner />
      <Text size="2">{file.name}</Text>
      <CurrentEditors editors={editors} className={styles.currentEditors} />
      <Button disabled={isCompiling} onClick={handleOnCompileClick}>
        <Spinner loading={isCompiling} />
        {!isCompiling && <LucidePlay size="19" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default EditorHeader;
