import { Group, Panel, useDefaultLayout, useGroupRef, type PanelImperativeHandle } from 'react-resizable-panels';
import { useMemo, useRef, useState } from 'react';
import ImagePreview from '../image-preview/ImagePreview';
import ResizeSeparator from '../../../shared/components/separator/ResizeSeparator';
import { Tabs } from '@radix-ui/themes';
import { FileBracesCornerIcon, HomeIcon, LucideFile } from 'lucide-react';
import FileTree from '../file-tree/FileTree';
import type { Document, DocumentImage } from '../../../features/documents/document';
import EditorView from '../editor-view/EditorView';
import { useNavigate } from 'react-router';
import KeyboardSaveProvider from '../provider/KeyboardSaveProvider';
import { useGetImages } from '../../../features/documents/api';
import styles from './DocumentView.module.css';

export type DocumentFile = { type: 'image'; file: DocumentImage } | { type: 'tex'; file: Document };

interface DocumentViewProps {
  document: Document;
}

export function DocumentView({ document }: DocumentViewProps) {

  const documentId = document.id;
  const { data: images = [], isLoading: isImageLoading } = useGetImages(documentId);
  const [selectedFile, setSelectedFile] = useState<DocumentFile | undefined>();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'document-page-layout',
    storage: localStorage,
  });
  const leftPanelRef = useRef<PanelImperativeHandle | null>(null);
  const nav = useNavigate();
  const [isHoveringHome, setIsHoveringHome] = useState(false);

  const files: DocumentFile[] = useMemo(
    () => [
      ...(document ? [{ type: 'tex', file: document } as const] : []),
      ...images.map((img) => ({ type: 'image', file: img }) as const),
    ],
    [document, images],
  );

  const handleSeparatorClick = () => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  const [selectedTab, setSelectedTab] = useState('file');
  const groupRef = useGroupRef();

  const handleCloseFileTree = () => {
    setSelectedTab('');
    groupRef.current?.setLayout({ navigation: 0, main: 100 });
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);

    // Reset layout when switching tabs
    const layout = groupRef.current?.getLayout();
    if (layout?.navigation === 0) {
      groupRef.current?.setLayout({ navigation: 30, main: 70 });
    }
  };

  const handleHomeClick = () => {
    nav('/');
  };

  const handleFilePanelResize = () => {
    if (leftPanelRef.current?.isCollapsed()) {
      setSelectedTab('');
    } else if (!selectedTab) {
      setSelectedTab('file');
    }
  };

  return (
    <KeyboardSaveProvider>
      <Tabs.Root
        defaultValue="file"
        orientation="vertical"
        value={selectedTab}
        onValueChange={handleTabChange}
        className={styles.tabsRoot}
      >
        <Tabs.List className={styles.tabsList}>
          <div
            className={styles.homeIconContainer}
            onMouseEnter={() => setIsHoveringHome(true)}
            onMouseLeave={() => setIsHoveringHome(false)}
            onClick={handleHomeClick}
          >
            <HomeIcon size={30} className={`${styles.homeIcon} ${isHoveringHome ? styles.visible : styles.hidden}`} />

            <FileBracesCornerIcon
              size={30}
              className={`${styles.homeIcon} ${isHoveringHome ? styles.hidden : styles.visible}`}
            />
          </div>
          <Tabs.Trigger value="file">
            <LucideFile />
          </Tabs.Trigger>
        </Tabs.List>

        <Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChanged} groupRef={groupRef}>
          <Panel
            id="navigation"
            collapsible
            minSize="20%"
            defaultSize="25%"
            panelRef={leftPanelRef}
            onResize={handleFilePanelResize}
          >
            <Tabs.Content value="file" className={styles.tabsContent}>
              <FileTree selectedFile={selectedFile} setSelectedFile={setSelectedFile} files={files} documentId={documentId!} isLoading={isImageLoading} onClose={handleCloseFileTree} />
            </Tabs.Content>
          </Panel>
          <ResizeSeparator onClick={handleSeparatorClick} />
          <Panel id="main" minSize="20%" defaultSize="75%">
            {selectedFile && selectedFile.type === 'image' ? (
              <ImagePreview selectedFile={selectedFile.file} />
            ) : documentId ? (
              <EditorView documentId={documentId} file={selectedFile?.type === 'tex' ? selectedFile.file : undefined} />
            ) : null}
          </Panel>
        </Group>
      </Tabs.Root>
    </KeyboardSaveProvider>
  );
}
