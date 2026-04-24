import { Group, Panel, type PanelImperativeHandle } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/latex-editor/LatexEditor';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import EditorHeader from './header/EditorHeader';
import { useRef } from 'react';
import { useParams } from 'react-router';
import type { Document } from '../../../features/documents/document';

interface EditorViewProps {
  file: Document | undefined;
}

const EditorView = ({ file }: EditorViewProps) => {
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

  const { documentId } = useParams();
  return (
    <div className={styles.container}>
      <EditorHeader file={file} />
      <Group className={styles.panelGroup}>
        <Panel minSize={'20%'} defaultSize="50%" className={styles.panel}>
          {documentId && <LatexEditor content={file?.content} />}
        </Panel>
        <ResizeSeparator onClick={handleSeparatorClick} />
        <Panel collapsible className={styles.panel} minSize="20%" panelRef={rightPanelRef}>
          {documentId && <PDFPreview docId={documentId} />}
        </Panel>
      </Group>
    </div>
  );
};

export default EditorView;
