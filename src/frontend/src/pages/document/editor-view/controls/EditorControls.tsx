import { IconButton, Separator } from '@radix-ui/themes';
import styles from './EditorControls.module.css';
import {
  LucideBold,
  LucideItalic,
  LucideList,
  LucideListOrdered,
  LucideOmega,
  LucideTable,
  LucideUnderline,
} from 'lucide-react';
import type { EditorControlType } from './controlType';

interface EditorControlsProps {
  onClick: (controlType: EditorControlType) => void;
}

const EditorControls = ({ onClick }: EditorControlsProps) => {
  const handleOnClick = (controlType: EditorControlType) => {
    console.log('FISCH');
    onClick(controlType);
  };

  return (
    <div className={styles.container}>
      <IconButton size="1" variant="ghost">
        <LucideBold size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideItalic size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideUnderline size={16} />
      </IconButton>
      <Separator orientation="vertical" />
      <IconButton size="1" variant="ghost">
        <LucideOmega size={16} />
      </IconButton>
      <Separator orientation="vertical" />
      <IconButton size="1" variant="ghost">
        <LucideTable size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideList size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideListOrdered size={16} />
      </IconButton>
    </div>
  );
};

export default EditorControls;
