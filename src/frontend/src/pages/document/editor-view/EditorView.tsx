import { Group, Panel } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/LatexEditor';
import type { LatexFile } from '../sampleData';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import { useParams } from 'react-router';

interface EditorViewProps {
  selectedFile: LatexFile;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  const { documentId } = useParams();
  return (
    <Group>
      <Panel minSize="30%" defaultSize="50%" className={styles.panel}>
        <LatexEditor texFile={selectedFile.content} />
      </Panel>
      <ResizeSeparator />
      <Panel collapsible className={styles.panel} minSize="20%">
        {documentId ? <PDFPreview docId={documentId!} /> : <div>Document ID is missing</div>}
      </Panel>
    </Group>
  );
};

export default EditorView;
