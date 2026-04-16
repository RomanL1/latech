import { Group, Panel } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/LatexEditor';
import type { LatexFile } from '../sampleData';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';

interface EditorViewProps {
  selectedFile: LatexFile;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  return (
    <Group>
      <Panel minSize="30%" defaultSize="50%" className={styles.panel}>
        <LatexEditor texFile={selectedFile.content} />
      </Panel>
      <ResizeSeparator />
      <Panel collapsible className={styles.panel} minSize="20%">
        <PDFPreview docId="13d76659-ff26-4f18-add5-04186a84a2a7" />
      </Panel>
    </Group>
  );
};

export default EditorView;
