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
import { useGetDocument, useUnlockDocument } from '../../../features/documents/api';
import { Button, Flex, Text, TextField } from '@radix-ui/themes';

interface EditorViewProps {
  file: Document | undefined;
  documentId: string | undefined;
}

const EditorView = ({ file, documentId }: EditorViewProps) => {
  const rightPanelRef = useRef<PanelImperativeHandle | null>(null);
  const [pdfEventSource, setPdfEventSource] = useState<ResilientEventSource | null>(null);
  const [password, setPassword] = useState('');

  const { data: fetchedDocument } = useGetDocument(documentId ?? '');

  const unlockMutation = useUnlockDocument(documentId ?? '');

  useEffect(() => {
    if (!documentId) return;

    const source = getPDFRenderedEventSource(documentId);
    let isActive = true;

    // Using a microtask prevents the synchronous cascading render while
    // keeping the connection cycle tightly bound to the effect.
    Promise.resolve().then(() => {
      if (isActive) {
        setPdfEventSource(source);
      }
    });

    return () => {
      isActive = false;
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

  const handleUnlock = async () => {
    if (!password.trim()) return;
    try {
      await unlockMutation.mutateAsync(password);
      setPassword('');
    } catch {
      // keep password so user can correct and retry
    }
  };

  if (!documentId) {
    return <div className={styles.container}>No file selected</div>;
  }

  const isLocked = !!fetchedDocument && fetchedDocument.secured && fetchedDocument.content == null;

  if (isLocked) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Flex direction="column" gap="3" style={{ width: '300px' }}>
          <Text size="3" weight="bold">
            Protected document
          </Text>
          <Text size="2" color="gray">
            Enter the password to access this document.
          </Text>
          <TextField.Root
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleUnlock();
              }
            }}
          />
          <Button onClick={handleUnlock} disabled={unlockMutation.isPending || !password.trim()}>
            {unlockMutation.isPending ? 'Unlocking...' : 'Unlock'}
          </Button>
          {unlockMutation.isError ? (
            <Text size="2" color="red">
              {unlockMutation.error?.message ?? 'Wrong password or access denied.'}
            </Text>
          ) : null}
        </Flex>
      </div>
    );
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
