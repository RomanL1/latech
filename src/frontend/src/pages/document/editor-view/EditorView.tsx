import { useEffect, useRef, useState } from 'react';
import { Group, Panel, type PanelImperativeHandle } from 'react-resizable-panels';
import type { Document } from '../../../features/documents/document';
import { getPDFRenderedEventSource, type ResilientEventSource } from '../../../features/pdf-preview/api';
import LatexEditor from '../../../shared/components/latex-editor/LatexEditor';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import styles from './EditorView.module.css';
import EditorHeader from './header/EditorHeader';

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

  return (
    <div className={styles.container}>
      <EditorHeader file={file} pdfEventSource={pdfEventSource} />
      <Group className={styles.panelGroup}>
        <Panel minSize={'20%'} defaultSize="50%" className={styles.panel}>
          {documentId ? <LatexEditor roomId={documentId} content={file?.content ?? ''} /> : 'No file selected'}
        </Panel>
        <ResizeSeparator onClick={handleSeparatorClick} />
        <Panel collapsible className={styles.panel} minSize="20%" panelRef={rightPanelRef}>
          {documentId ? <PDFPreview docId={documentId} pdfEventSource={pdfEventSource} /> : 'No file selected'}
        </Panel>
      </Group>
    </div>
  );
};

export default EditorView;
