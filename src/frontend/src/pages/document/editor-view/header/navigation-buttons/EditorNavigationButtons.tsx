import { IconButton } from '@radix-ui/themes';
import { LucideRedo, LucideUndo } from 'lucide-react';
import { useEditor } from '../../../../../shared/components/latex-editor/EditorContext';

const EditorNavigationButtons = () => {
  const { undo, redo } = useEditor();
  const handleUndoClick = () => {
    undo();
  };

  const handleRedoClick = () => {
    redo();
  };

  return (
    <>
      <IconButton size="1" variant="ghost" onClick={handleUndoClick}>
        <LucideUndo size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={handleRedoClick}>
        <LucideRedo size={16} />
      </IconButton>
    </>
  );
};

export default EditorNavigationButtons;
