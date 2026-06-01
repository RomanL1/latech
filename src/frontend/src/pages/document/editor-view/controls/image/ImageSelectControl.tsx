import { IconButton, Separator, Text } from '@radix-ui/themes';
import { LucideImage } from 'lucide-react';
import { useParams } from 'react-router';
import { useGetImages } from '../../../../../features/documents/api';
import { useEditor } from '../../../../../shared/components/latex-editor/EditorContext';
import { NonFocusStealingDropdown } from '../../../../../shared/components/non-focus-stealing-dropdown/NonFocusStealingDropdown';
import { Fragment } from 'react';
import type { DocumentImage } from '../../../../../features/documents/document';

export function ImageSelectControl() {
  const documentId = useParams().documentId!;
  const { data: images = [] } = useGetImages(documentId);

  const { insertImage } = useEditor();

  function handleSelected(fileName: string) {
    console.log(fileName);
    insertImage(fileName);
  }

  const trigger = (
    <IconButton size="1" variant="ghost" title="Insert image">
      <LucideImage size={16} />
    </IconButton>
  );

  return (
    <NonFocusStealingDropdown trigger={trigger} onOptionSelected={handleSelected}>
      <ImageSelectOptions images={images} />
    </NonFocusStealingDropdown>
  );
}

interface ImageSelectOptionsProps {
  images: DocumentImage[];
}

function ImageSelectOptions({ images }: ImageSelectOptionsProps) {
  if (images.length === 0) {
    return <Text>No images uploaded yet</Text>;
  }

  return (
    <>
      <span>Images</span>
      {images.map(({ id, name }, index) => (
        <Fragment key={id}>
          {index !== 0 && <Separator size="4" />}
          <NonFocusStealingDropdown.Option value={name}>
            <Text size="2">{name}</Text>
          </NonFocusStealingDropdown.Option>
        </Fragment>
      ))}
    </>
  );
}
