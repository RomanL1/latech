import { Flex, IconButton, Skeleton, Text } from '@radix-ui/themes';
import { FileCodeCorner, LucideFileImage, LucideX } from 'lucide-react';
import styles from './FileTree.module.css';
import FileTreeItem from './item/FileTreeItem';
import UploadImageDialog from './upload-image-dialog/UploadImageDialog';
import {
  useDeleteImage,
  useDownloadImage,
  useGetDocument,
  useGetImages,
  useRenameImage,
} from '../../../features/documents/api';
import { useParams } from 'react-router';
import type { DocumentFile } from '../DocumentPage';
import { useEffect } from 'react';

interface FileTreeProps {
  setSelectedFile: (file: DocumentFile | undefined) => void;
  selectedFile: DocumentFile | undefined;
  onClose?: () => void;
}

const FileTree = ({ selectedFile, setSelectedFile, onClose }: FileTreeProps) => {
  const documentId = useParams().documentId!;
  const { data: images = [], isLoading: isImageLoading } = useGetImages(documentId);
  const { data: document, isLoading: isDocumentLoading } = useGetDocument(documentId);
  const deleteQuery = useDeleteImage(documentId);
  const downloadMutation = useDownloadImage(documentId);
  const renameMutation = useRenameImage(documentId);

  useEffect(() => {
    if (isDocumentLoading || !document) return;

    setSelectedFile({ type: 'tex', file: document });
  }, [isDocumentLoading, setSelectedFile, document]);

  const handleOnDownload = (item: DocumentFile) => {
    if (!selectedFile) return;

    if (selectedFile.type === 'image') {
      downloadMutation.mutateAsync({ imageId: item.file.id, imageName: item.file.name });
    }
  };

  const onDelete = (item: DocumentFile) => {
    if (!selectedFile) return;

    if (selectedFile.type === 'image') {
      deleteQuery.mutateAsync(item.file.id).then(() => {
        setSelectedFile(undefined);
      });
    }
  };

  const handleOnNameChange = (item: DocumentFile, newName: string) => {
    if (!selectedFile) return;

    if (selectedFile.type === 'image') {
      renameMutation.mutateAsync({ imageId: item.file.id, newName: newName });
    }

    // TODO: handle renaming for tex document as well
  };

  const files: DocumentFile[] = [
    ...(document ? [{ type: 'tex', file: document } as const] : []),
    ...images.map((img) => ({ type: 'image', file: img }) as const),
  ];

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
      {isImageLoading || isDocumentLoading ? (
        <Flex direction="column" gap="3" className={styles.container}>
          <Skeleton height="20" />
          <Skeleton height="20" />
          <Skeleton height="20" />
        </Flex>
      ) : (
        <div className={styles.imageList}>
          {files.map((item) => (
            <FileTreeItem
              key={item.file.id}
              fileName={item.file.name}
              onClick={() => setSelectedFile(item)}
              onDelete={() => onDelete(item)}
              onNameChange={(newName) => handleOnNameChange(item, newName)}
              onDownload={() => handleOnDownload(item)}
              canDownload={item.type === 'image'}
              canDelete={item.type === 'image'}
              icon={item.type == 'image' ? <LucideFileImage size={20} /> : <FileCodeCorner size={20} />}
              isSelected={selectedFile?.file.id === item.file.id}
            />
          ))}
        </div>
      )}
    </Flex>
  );
};

export default FileTree;
