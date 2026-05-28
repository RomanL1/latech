import { Flex, IconButton, Skeleton, Text } from '@radix-ui/themes';
import { FileCodeCorner, LucideFileImage, LucideX, LockIcon } from 'lucide-react';
import styles from './FileTree.module.css';
import FileTreeItem from './item/FileTreeItem';
import UploadImageDialog from './upload-image-dialog/UploadImageDialog';
import {
  useDeleteImage,
  useDownloadImage,
  useGetDocument,
  useGetImages,
  useRenameDocument,
  useRenameImage,
} from '../../../features/documents/api';
import { useParams } from 'react-router';
import type { DocumentFile } from '../DocumentPage';
import { useCallback, useEffect, useMemo } from 'react';

interface FileTreeProps {
  setSelectedFile: (file: DocumentFile | undefined) => void;
  selectedFile: DocumentFile | undefined;
  onClose?: () => void;
}

const FileTree = ({ selectedFile, setSelectedFile, onClose }: FileTreeProps) => {
  const documentId = useParams().documentId!;

  const { data: document, isLoading: isDocumentLoading } = useGetDocument(documentId);

  const documentUnlocked = !!document && (!document.secured || document.content != null);

  const { data: images = [], isLoading: isImageLoading } = useGetImages(documentId, documentUnlocked);

  const deleteQuery = useDeleteImage(documentId);
  const downloadMutation = useDownloadImage(documentId);
  const renameImageMutation = useRenameImage(documentId);
  const renameDocumentMutation = useRenameDocument(documentId);

  useEffect(() => {
    if (isDocumentLoading || !document) return;

    if (!documentUnlocked) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile({ type: 'tex', file: document });
  }, [isDocumentLoading, setSelectedFile, document, documentUnlocked]);

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
          setSelectedFile(undefined);
        });
      }
    },
    [deleteQuery, setSelectedFile],
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

    console.log('Unknown file type for renaming:', item.type);
  };

  const files: DocumentFile[] = useMemo(
    () => [
      ...(documentUnlocked && document ? [{ type: 'tex', file: document } as const] : []),
      ...images.map((img) => ({ type: 'image', file: img }) as const),
    ],
    [documentUnlocked, document, images],
  );

  const isLoading = isDocumentLoading || (documentUnlocked && isImageLoading);

  return (
    <Flex direction="column" gap="5">
      <div className={styles.header}>
        <Text size="5" wrap="nowrap">
          File Tree
        </Text>

        {documentUnlocked ? <UploadImageDialog className={styles.headerButton} /> : null}

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
      ) : document && !documentUnlocked ? (
        <Flex direction="column" align="center" gap="2" className={styles.container}>
          <LockIcon size={24} />
          <Text size="2" color="gray">
            Document is locked
          </Text>
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
