import { IconButton, Separator } from '@radix-ui/themes';
import {
  LucideBold,
  LucideItalic,
  LucideList,
  LucideListOrdered,
  LucideOmega,
  LucideSigma,
  LucideStrikethrough,
  LucideSubscript,
  LucideSuperscript,
  LucideUnderline,
} from 'lucide-react';
import { useEditor } from '../../../../shared/components/latex-editor/EditorContext';
import { LatexListStructure } from '../../../../shared/components/latex-editor/controls/lists';
import { LatexMacro } from '../../../../shared/components/latex-editor/controls/single-macro';
import styles from './EditorControls.module.css';
import FontSizeControl from './font-size/FontSizeControl';
import { ImageSelectControl } from './image/ImageSelectControl';
import { TableControl } from './table/TableControl';

const EditorControls = () => {
  const { toggleSurroundingMacro, toggleListStructure } = useEditor();

  function toggleBold() {
    toggleSurroundingMacro(new LatexMacro('textbf'));
  }

  function toggleItalic() {
    toggleSurroundingMacro(new LatexMacro('textit'));
  }

  function toggleUnderline() {
    toggleSurroundingMacro(new LatexMacro('underline'));
  }

  function toggleStrikethrough() {
    toggleSurroundingMacro(new LatexMacro('sout'));
  }

  function toggleSuperscript() {
    toggleSurroundingMacro(new LatexMacro('textsuperscript'));
  }

  function toggleSubscript() {
    toggleSurroundingMacro(new LatexMacro('textsubscript'));
  }

  function toggleNumberedList() {
    toggleListStructure(new LatexListStructure('enumerate'));
  }

  function toggleBulletpointList() {
    toggleListStructure(new LatexListStructure('itemize'));
  }

  return (
    <div className={styles.container}>
      <FontSizeControl />
      <Separator orientation="vertical" />

      <IconButton size="1" variant="ghost" onClick={() => toggleBold()} title="Bold">
        <LucideBold size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleItalic()} title="Italic">
        <LucideItalic size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleUnderline()} title="Underline">
        <LucideUnderline size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleStrikethrough()} title="Strikethrough">
        <LucideStrikethrough size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleSuperscript()} title="Superscript">
        <LucideSuperscript size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleSubscript()} title="Subscript">
        <LucideSubscript size={16} />
      </IconButton>

      <Separator orientation="vertical" />

      <IconButton size="1" variant="ghost">
        <LucideOmega size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost">
        <LucideSigma size={16} />
      </IconButton>
      <Separator orientation="vertical" />

      <TableControl />
      <IconButton size="1" variant="ghost" onClick={() => toggleBulletpointList()} title="Bullet point list">
        <LucideList size={16} />
      </IconButton>
      <IconButton size="1" variant="ghost" onClick={() => toggleNumberedList()} title="Numbered list">
        <LucideListOrdered size={16} />
      </IconButton>

      <Separator orientation="vertical" />

      <ImageSelectControl />
    </div>
  );
};

export default EditorControls;
