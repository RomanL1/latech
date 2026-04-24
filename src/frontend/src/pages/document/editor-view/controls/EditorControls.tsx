import { IconButton, Separator } from '@radix-ui/themes';
import styles from './EditorControls.module.css';
import {
  LucideBold,
  LucideImage,
  LucideItalic,
  LucideList,
  LucideListOrdered,
  LucideOmega,
  LucideSigma,
  LucideTable,
  LucideUnderline,
} from 'lucide-react';
import { EditorControlType } from './EditorControlType';
import HeadingControl from './heading-control/HeadingControl';
import FontsizeControl from './fontsize-control/FontsizeControl';

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
      <HeadingControl />
      <FontsizeControl />
      <Separator orientation="vertical" />

      <IconButton size="1" variant="ghost" onClick={() => handleOnClick(EditorControlType.BOLD)}>
        <LucideBold size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => handleOnClick(EditorControlType.ITALIC)}>
        <LucideItalic size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => handleOnClick(EditorControlType.UNDERLINE)}>
        <LucideUnderline size={16} />
      </IconButton>
      <Separator orientation="vertical" />

      <IconButton size="1" variant="ghost">
        <LucideOmega size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideSigma size={16} />
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

      <Separator orientation="vertical" />
      <IconButton size="1" variant="ghost">
        <LucideImage size={16} />
      </IconButton>
    </div>
  );
};

export default EditorControls;
