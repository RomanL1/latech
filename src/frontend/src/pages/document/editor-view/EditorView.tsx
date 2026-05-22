import { Group, Panel, type PanelImperativeHandle } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/latex-editor/LatexEditor';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import EditorHeader from './header/EditorHeader';
import { useRef, useEffect, useState } from 'react';
import type { Document } from '../../../features/documents/document';
import { getPDFRenderedEventSource, type ResilientEventSource } from '../../../features/pdf-preview/api';
import { EditorProvider } from '../../../shared/components/latex-editor/EditorProvider';

interface EditorViewProps {
  file: Document | undefined;
  documentId: string | undefined;
}

const EditorView = ({ file, documentId }: EditorViewProps) => {
  const rightPanelRef = useRef<PanelImperativeHandle | null>(null);
  const [pdfEventSource, setPdfEventSource] = useState<ResilientEventSource | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const source = getPDFRenderedEventSource(documentId);

    // Using a microtask prevents the synchronous cascading render while
    // keeping the connection cycle tightly bound to the effect.
    Promise.resolve().then(() => {
      setPdfEventSource(source);
    });

    return () => {
      source.close();
      setPdfEventSource(null);
    };
  }, [documentId]);

  const handleSeparatorClick = () => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  if (!documentId) {
    return <div className={styles.container}>No file selected</div>;
  }

  return (
    <EditorProvider roomId={documentId}>
      <div className={styles.container}>
        <EditorHeader file={file} pdfEventSource={pdfEventSource} />
        <Group className={styles.panelGroup}>
          <Panel minSize={'20%'} defaultSize="50%" className={styles.panel}>
            <div style={{ height: '100%' }} onKeyDown={(e) => e.stopPropagation()}>
              <LatexEditor content={file?.content ?? ''} />
            </div>
          </Panel>
          <ResizeSeparator onClick={handleSeparatorClick} />
          <Panel collapsible className={styles.panel} minSize="20%" panelRef={rightPanelRef}>
            <PDFPreview docId={documentId} pdfEventSource={pdfEventSource} />
          </Panel>
        </Group>
      </div>
    </EditorProvider>
  );
};

export default EditorView;
