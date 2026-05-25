import { IconButton, Text } from '@radix-ui/themes';
import { LucideImage } from 'lucide-react';
import { useParams } from 'react-router';
import { useGetDocument, useGetImages } from '../../../../../features/documents/api';
import { useEditor } from '../../../../../shared/components/latex-editor/EditorContext';
import { NonFocusStealingDropdown } from '../../../../../shared/components/non-focus-stealing-dropdown/NonFocusStealingDropdown';

export function ImageSelectControl() {
  const documentId = useParams().documentId!;
  const { data: document } = useGetDocument(documentId);

  const documentUnlocked = !!document && (!document.secured || document.content != null);
  const { data: images = [] } = useGetImages(documentId, documentUnlocked);

  const { insertImage } = useEditor();

  function handleSelected(fileName: string) {
    insertImage(fileName);
  }

  const trigger = (
    <IconButton size="1" variant="ghost" title="Insert image">
      <LucideImage size={16} />
    </IconButton>
  );

  const content =
    images.length === 0 ? (
      <Text>No images uploaded yet</Text>
    ) : (
      images.map(({ id, name }) => (
        <NonFocusStealingDropdown.Option value={name} key={id}>
          <Text size="2">{name}</Text>
        </NonFocusStealingDropdown.Option>
      ))
    );

  return (
    <NonFocusStealingDropdown trigger={trigger} onOptionSelected={handleSelected}>
      {content}
    </NonFocusStealingDropdown>
  );
}
