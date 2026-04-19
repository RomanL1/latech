import { Group, Panel, useDefaultLayout, useGroupRef } from 'react-resizable-panels';
import { useState } from 'react';
import ImagePreview from './image-preview/ImagePreview';
import styles from './DocumentPage.module.css';
import ResizeSeparator from '../../shared/components/separator/ResizeSeparator';
import { Tabs } from '@radix-ui/themes';
import { LucideFile, LucideSettings } from 'lucide-react';
import FileTree from './file-tree/FileTree';
import type { DocumentImage } from '../../features/documents/document';

export function DocumentPage() {
  const [selectedFile, setSelectedFile] = useState<DocumentImage | undefined>();
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
          {selectedFile && (selectedFile.mimeType === 'image/jpeg' || selectedFile.mimeType === 'image/png') ? (
            <ImagePreview selectedFile={selectedFile} />
          ) : (
            <div>Not supported yet</div>
            // <EditorView selectedFile={selectedFile} />
          )}
        </Panel>
      </Group>
    </Tabs.Root>
  );
}
