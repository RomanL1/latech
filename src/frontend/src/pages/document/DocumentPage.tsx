import { Group, Panel, Separator } from 'react-resizable-panels';
import LatexEditor from '../../shared/components/LatexEditor';
import SideNavigationBar from './side-naviagtion-bar/SideNavigationBar';
import { useState } from 'react';
import ImagePreview from './image-preview/ImagePreview';
import type { SampleFile } from './sampleData';

export function DocumentPage() {
  const [selectedFile, setSelectedFile] = useState<SampleFile>();

  return (
    <>
      <SideNavigationBar selectedFile={selectedFile} setSeledtedFile={setSelectedFile} />
      <Group>
        <Panel collapsible minSize={20}>
          Hallo
        </Panel>
        <Separator />
        <Panel>
          {selectedFile &&
            (selectedFile.type === 'image/jpeg' ? (
              <ImagePreview selectedFile={selectedFile} />
            ) : (
              <LatexEditor texFile={selectedFile.content} />
            ))}
        </Panel>
      </Group>
    </>
  );
}
