import { Group, Panel, useDefaultLayout, useGroupRef } from 'react-resizable-panels';
import { useState } from 'react';
import ImagePreview from './image-preview/ImagePreview';
import styles from './DocumentPage.module.css';
import ResizeSeparator from '../../shared/components/separator/ResizeSeparator';
import { Tabs } from '@radix-ui/themes';
import { LucideFile, LucideSettings } from 'lucide-react';
import FileTree from './file-tree/FileTree';
import type { Document, DocumentImage } from '../../features/documents/document';
import EditorView from './editor-view/EditorView';

export type DocumentFile = { type: 'image'; file: DocumentImage } | { type: 'tex'; file: Document };

export function DocumentPage() {
  const [selectedFile, setSelectedFile] = useState<DocumentFile | undefined>();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'document-page-layout',
    storage: localStorage,
  });

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

  return (
    <Tabs.Root
      defaultValue="file"
      orientation="vertical"
      value={selectedTab}
      onValueChange={handleTabChange}
      className={styles.tabsRoot}
    >
      <Tabs.List className={styles.tabsList}>
        <Tabs.Trigger value="file">
          <LucideFile />
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <LucideSettings />
        </Tabs.Trigger>
      </Tabs.List>

      <Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChanged} groupRef={groupRef}>
        <Panel id="navigation" collapsible minSize="20%">
          <Tabs.Content value="file" className={styles.tabsContent}>
            <FileTree selectedFile={selectedFile} setSelectedFile={setSelectedFile} onClose={handleCloseFileTree} />
          </Tabs.Content>
          <Tabs.Content value="settings" className={styles.tabsContent}>
            <LucideSettings />
            Settings content
          </Tabs.Content>
          <ResizeSeparator />
        </Panel>
        <ResizeSeparator />
        <Panel id="main" minSize="20%">
          {selectedFile && selectedFile.type === 'image' ? (
            <ImagePreview selectedFile={selectedFile.file} />
          ) : selectedFile && selectedFile.type === 'tex' ? (
            <EditorView selectedFile={selectedFile?.file} />
          ) : null}
        </Panel>
      </Group>
    </Tabs.Root>
  );
}
