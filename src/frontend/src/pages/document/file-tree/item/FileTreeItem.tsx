import styles from './FileTreeItem.module.css';
import { Text, TextField } from '@radix-ui/themes';
import FileTreeItemDotMenu from './dot-menu/FileTreeItemDotMenu';
import { useEffect, useRef, useState } from 'react';
import type { DocumentImage } from '../../../../features/documents/document';
import { useDeleteImage, useDownloadImage, useRenameImage } from '../../../../features/documents/api';
import { useParams } from 'react-router';

interface FileTreeItemProps {
  file: DocumentImage;
  icon: React.ReactNode;
  isSelected: boolean;
  setSelectedFile: (file?: DocumentImage | undefined) => void;
  onClick: () => void;
}

const FileTreeItem = ({ file, icon, isSelected, onClick, setSelectedFile }: FileTreeItemProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [textFieldValue, setTextFieldValue] = useState(file.name);
  const fileTreeItemRef = useRef<HTMLDivElement>(null);
  const documentId = useParams().documentId!;
  const deleteQuery = useDeleteImage(documentId);
  const downloadMutation = useDownloadImage(documentId, file.name);
  const renameMutation = useRenameImage(documentId, file.id);

  useEffect(() => {
    if (isRenaming) {
      requestAnimationFrame(() => {
        textFieldRef.current?.focus();
        textFieldRef.current?.select();
        console.log(textFieldRef.current);
      });
    }
  }, [isRenaming]);

  useEffect(() => {
    if (isSelected && !isRenaming) {
      fileTreeItemRef.current?.focus();
    }
  });

  const handleOnRename = () => {
    setIsRenaming(true);
  };

  const handleOnDownload = () => {
    downloadMutation.mutateAsync(file.id);
  };

  const handleOnDelete = () => {
    deleteQuery.mutateAsync(file.id).then(() => {
      setSelectedFile(undefined);
    });
  };

  const handleOnKeyUp = (e: React.KeyboardEvent) => {
    console.log('KEY UP', e.key);
    if (e.key !== 'Enter') return;

    if (isRenaming) {
      renameMutation
        .mutateAsync(textFieldValue)
        .then(() => {
          setIsRenaming(false);
        })
        .catch(() => {
          setTextFieldValue(file.name);
          setIsRenaming(false);
        });
    }

    setIsRenaming(!isRenaming);
  };

  const handleOnBlur = () => {
    renameMutation
      .mutateAsync(textFieldValue)
      .then(() => {
        setIsRenaming(false);
      })
      .catch(() => {
        setTextFieldValue(file.name);
        setIsRenaming(false);
      });
  };

  const handleOnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFieldValue(e.target.value);
  };

  return (
    <div
      className={styles.container}
      key={file.id}
      onClick={() => {
        onClick();
      }}
      onFocus={onClick}
      onKeyUp={handleOnKeyUp}
      data-selected={isSelected}
      tabIndex={0}
      ref={fileTreeItemRef}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      {isRenaming ? (
        <TextField.Root
          className={styles.textField}
          size="1"
          value={textFieldValue}
          onChange={handleOnNameChange}
          onBlur={handleOnBlur}
          onFocus={() => console.log('FOCUS')}
          ref={textFieldRef}
          onKeyUp={(e) => {
            e.stopPropagation();
            handleOnKeyUp(e);
          }}
          autoFocus
        />
      ) : (
        <Text size="1" wrap="nowrap" truncate>
          {file.name}
        </Text>
      )}
      <FileTreeItemDotMenu
        className={styles.dotMenu}
        onRename={handleOnRename}
        onDownload={handleOnDownload}
        onDelete={handleOnDelete}
      />
    </div>
  );
};

export default FileTreeItem;
