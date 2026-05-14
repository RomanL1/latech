import { Button, Flex, IconButton, Skeleton, Text, TextField } from '@radix-ui/themes';
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
  useUnlockDocument,
} from '../../../features/documents/api';
import { useParams } from 'react-router';
import type { DocumentFile } from '../DocumentPage';
import { useEffect, useMemo, useState } from 'react';

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

  const unlockMutation = useUnlockDocument(documentId);
  const deleteQuery = useDeleteImage(documentId);
  const downloadMutation = useDownloadImage(documentId);
  const renameMutation = useRenameImage(documentId);

  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isDocumentLoading || !document) return;

    if (!documentUnlocked) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile({ type: 'tex', file: document });
  }, [isDocumentLoading, setSelectedFile, document, documentUnlocked]);

  const handleUnlock = async () => {
    if (!password.trim()) return;

    await unlockMutation.mutateAsync(password);
    setPassword('');
  };

  const handleOnDownload = (item: DocumentFile) => {
    if (!selectedFile) return;

    if (item.type === 'image') {
      downloadMutation.mutateAsync({ imageId: item.file.id, imageName: item.file.name });
    }
  };

  const onDelete = (item: DocumentFile) => {
    if (!selectedFile) return;

    if (item.type === 'image') {
      deleteQuery.mutateAsync(item.file.id).then(() => {
        setSelectedFile(undefined);
      });
    }
  };

  const handleOnNameChange = (item: DocumentFile, newName: string) => {
    if (!selectedFile) return;

    if (item.type === 'image') {
      renameMutation.mutateAsync({ imageId: item.file.id, newName });
    }

    // TODO: handle renaming for tex document as well
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
        <Flex direction="column" gap="3" className={styles.container}>
          <Text size="3" weight="bold">
            Protected document
          </Text>

          <Text size="2" color="gray">
            Enter the password to access this document.
          </Text>

          <TextField.Root
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleUnlock();
              }
            }}
          />

          <Button onClick={handleUnlock} disabled={unlockMutation.isPending || !password.trim()}>
            {unlockMutation.isPending ? 'Unlocking...' : 'Unlock'}
          </Button>

          {unlockMutation.isError ? (
            <Text size="2" color="red">
              Wrong password or access denied.
            </Text>
          ) : null}
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
