import { Group, Panel } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/LatexEditor';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import { useParams } from 'react-router';
import type { Document } from '../../../features/documents/document';

interface EditorViewProps {
  selectedFile: Document | undefined;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  const { documentId } = useParams();
  return (
    <Group>
      <Panel minSize="30%" defaultSize="50%" className={styles.panel}>
        <LatexEditor content={selectedFile?.content} />
      </Panel>
      <ResizeSeparator />
      <Panel collapsible className={styles.panel} minSize="20%">
        {documentId && <PDFPreview docId={documentId} />}
      </Panel>
    </Group>
  );
};

export default EditorView;
