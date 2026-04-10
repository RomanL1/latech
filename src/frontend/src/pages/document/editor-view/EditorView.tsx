import { Group, Panel, type PanelImperativeHandle } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/latex-editor/LatexEditor';
import type { LatexFile } from '../sampleData';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import EditorHeader from './header/EditorHeader';
import { useRef } from 'react';

interface EditorViewProps {
  selectedFile: LatexFile;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  const rightPanelRef = useRef<PanelImperativeHandle | null>(null);

  const handleSeparatorClick = () => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <div className={styles.container}>
      <EditorHeader file={selectedFile} />
      <Group className={styles.panelGroup}>
        <Panel minSize={'20%'} defaultSize="50%" className={styles.panel}>
          <LatexEditor texFile={selectedFile.content} />
        </Panel>
        <ResizeSeparator onClick={handleSeparatorClick} />
        <Panel collapsible className={styles.panel} minSize="20%" panelRef={rightPanelRef}>
          <PDFPreview />
        </Panel>
      </Group>
    </div>
  );
};

export default EditorView;
