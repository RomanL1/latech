import { Group, Panel } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/LatexEditor';
import type { LatexFile } from '../sampleData';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import EditorHeader from './header/EditorHeader';

interface EditorViewProps {
  selectedFile: LatexFile;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  return (
    <div className={styles.container}>
      <EditorHeader file={selectedFile} />
      <Group className={styles.panelGroup}>
        <Panel minSize="30%" defaultSize="50%" className={styles.panel}>
          <LatexEditor texFile={selectedFile.content} />
        </Panel>
        <ResizeSeparator />
        <Panel collapsible className={styles.panel} minSize="20%">
          <PDFPreview />
        </Panel>
      </Group>
    </div>
  );
};

export default EditorView;
