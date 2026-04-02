import { Group, Panel, Separator } from 'react-resizable-panels';
import LatexEditor from '../../../shared/components/LatexEditor';
import type { LatexFile } from '../sampleData';
import PDFPreview from '../../../shared/components/pdf-preview/PDFPreview';
import styles from './EditorView.module.css';
import ResizeSeparator from '../../../shared/components/separator/Separator';

interface EditorViewProps {
  selectedFile: LatexFile;
}

const EditorView = ({ selectedFile }: EditorViewProps) => {
  return (
    <Group>
      <Panel collapsible defaultSize="50%" className={styles.panel}>
        <LatexEditor texFile={selectedFile.content} />
      </Panel>
      <ResizeSeparator />
      <Panel collapsible className={styles.panel}>
        <PDFPreview />
      </Panel>
    </Group>
  );
};

export default EditorView;
