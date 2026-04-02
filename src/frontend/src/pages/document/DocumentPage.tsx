import { Group, Panel, useDefaultLayout } from 'react-resizable-panels';
import SideNavigationBar from './side-naviagtion-bar/SideNavigationBar';
import { useState } from 'react';
import ImagePreview from './image-preview/ImagePreview';
import type { SampleFile } from './sampleData';
import EditorView from './editor-view/EditorView';
import ResizeSeparator from '../../shared/components/separator/Separator';

export function DocumentPage() {
  const [selectedFile, setSelectedFile] = useState<SampleFile>();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'document-page-layout',
    storage: localStorage,
  });
  console.log('Selected file:', selectedFile);

  return (
    <Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChanged}>
      <Panel collapsible minSize="20%">
        <SideNavigationBar selectedFile={selectedFile} setSeledtedFile={setSelectedFile} />
        <ResizeSeparator />
      </Panel>
      <ResizeSeparator />
      <Panel>
        {selectedFile &&
          (selectedFile.type === 'image/jpeg' ? (
            <ImagePreview selectedFile={selectedFile} />
          ) : (
            <EditorView selectedFile={selectedFile} />
          ))}
      </Panel>
    </Group>
  );
}
