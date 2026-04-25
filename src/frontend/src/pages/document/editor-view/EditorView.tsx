import { Group, Panel, type PanelImperativeHandle } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/latex-editor/LatexEditor';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import EditorHeader from './header/EditorHeader';
import { useRef } from 'react';
import type { Document } from '../../../features/documents/document';

interface EditorViewProps {
  file: Document | undefined;
  documentId: string | undefined;
}

const EditorView = ({ file, documentId }: EditorViewProps) => {
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
      <EditorHeader file={file} />
      <Group className={styles.panelGroup}>
        <Panel minSize={'20%'} defaultSize="50%" className={styles.panel}>
          {documentId ? <LatexEditor roomId={documentId} content={file?.content ?? ''} /> : "No file selected"}
        </Panel>
        <ResizeSeparator onClick={handleSeparatorClick} />
        <Panel collapsible className={styles.panel} minSize="20%" panelRef={rightPanelRef}>
          {documentId ? <PDFPreview docId={documentId} /> : "No file selected"}
        </Panel>
      </Group>
    </div>
  );
};

export default EditorView;
