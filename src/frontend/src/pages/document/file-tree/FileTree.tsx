import { Flex, IconButton, Skeleton, Text } from '@radix-ui/themes';
import { FileCodeCorner, LucideFileImage, LucideX } from 'lucide-react';
import styles from './FileTree.module.css';
import FileTreeItem from './item/FileTreeItem';
import UploadImageDialog from './upload-image-dialog/UploadImageDialog';
import { useGetImages } from '../../../features/documents/api';
import { useParams } from 'react-router';
import type { DocumentImage } from '../../../features/documents/document';

interface FileTreeProps {
  setSelectedFile: (file?: DocumentImage | undefined) => void;
  selectedFile?: DocumentImage;
  onClose?: () => void;
}

const FileTree = ({ selectedFile, setSelectedFile, onClose }: FileTreeProps) => {
  const documentId = useParams().documentId!;
  const { data: images = [], isLoading } = useGetImages(documentId);

  return (
    <Flex direction="column" gap="3">
      <div className={styles.header}>
        <Text size="5" wrap="nowrap">
          File Tree
        </Text>
        <UploadImageDialog className={styles.headerButton} />
        <IconButton className={styles.headerButton} onClick={onClose}>
          <LucideX size={16} />
        </IconButton>
      </div>
      <Skeleton loading={isLoading}>
        <div className={styles.imageList}>
          {images.map((image) => (
            <FileTreeItem
              key={image.id}
              file={image}
              onClick={() => setSelectedFile(image)}
              setSelectedFile={setSelectedFile}
              icon={
                image.mimeType == 'image/jpeg' || image.mimeType == 'image/png' ? (
                  <LucideFileImage size={20} />
                ) : (
                  <FileCodeCorner size={20} />
                )
              }
              isSelected={selectedFile?.id === image.id}
            />
          ))}
        </div>
      </Skeleton>
    </Flex>
  );
};

export default FileTree;
