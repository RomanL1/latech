import { Flex, IconButton, Skeleton, Text } from '@radix-ui/themes';
import { FileCodeCorner, LucideFileImage, LucideX } from 'lucide-react';
import styles from './FileTree.module.css';
import FileTreeItem from './item/FileTreeItem';
import UploadImageDialog from './upload-image-dialog/UploadImageDialog';
import {
  useDeleteImage,
  useDownloadImage,
  useRenameDocument,
  useRenameImage,
} from '../../../features/documents/api';
import type { DocumentFile } from '../document-view/DocumentView';
import { useCallback } from 'react';
import type { Document } from '../../../features/documents/document';

interface FileTreeProps {
  setSelectedFile: (file: DocumentFile) => void;
  files: DocumentFile[];
  selectedFile: DocumentFile | undefined;
  document: Document;
  isLoading: boolean;
  onClose?: () => void;
  onDelete?: (file: DocumentFile) => void;
}

const FileTree = ({ selectedFile, setSelectedFile, files, document, isLoading, onClose }: FileTreeProps) => {
  const documentId = document.id;
  const deleteQuery = useDeleteImage(documentId);
  const downloadMutation = useDownloadImage(documentId);
  const renameImageMutation = useRenameImage(documentId);
  const renameDocumentMutation = useRenameDocument(documentId);

  const handleOnDownload = useCallback(
    (item: DocumentFile) => {
      if (item.type === 'image') {
        downloadMutation.mutateAsync({ imageId: item.file.id, imageName: item.file.name });
      }
    },
    [downloadMutation],
  );

  const onDelete = useCallback(
    (item: DocumentFile) => {
      if (item.type === 'image') {
        deleteQuery.mutateAsync(item.file.id).then(() => {
          setSelectedFile({ type: 'tex', file: document });
        });
      }
    },
    [deleteQuery, setSelectedFile, document],
  );

  const handleOnNameChange = (item: DocumentFile, newName: string) => {
    if (item.type === 'image') {
      renameImageMutation.mutateAsync({ imageId: item.file.id, newName });
      return;
    }

    if (item.type === 'tex') {
      renameDocumentMutation.mutateAsync({ newName });
      return;
    }
  };

  return (
    <Flex direction="column" gap="5">
      <div className={styles.header}>
        <Text size="5" wrap="nowrap">
          File Tree
        </Text>
        <UploadImageDialog className={styles.headerButton} />
        <IconButton className={styles.headerButton} onClick={onClose}>
          <LucideX size={16} />
        </IconButton>
      </div>

      {isLoading ? (
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
              fileName={item.file.name ?? 'Document'}
              onClick={() => setSelectedFile(item)}
              onDelete={() => onDelete(item)}
              onNameChange={(newName) => handleOnNameChange(item, newName)}
              onDownload={() => handleOnDownload(item)}
              canDownload={item.type === 'image'}
              canDelete={item.type === 'image'}
              icon={item.type === 'image' ? <LucideFileImage size={20} /> : <FileCodeCorner size={20} />}
              isSelected={selectedFile?.file.id === item.file.id}
            />
          ))}
        </div>
      )}
    </Flex>
  );
};

export default FileTree;
