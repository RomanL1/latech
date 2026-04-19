import styles from './FileTreeItem.module.css';
import { Text, TextField } from '@radix-ui/themes';
import FileTreeItemDotMenu from './dot-menu/FileTreeItemDotMenu';
import { useEffect, useRef, useState } from 'react';
import { file } from 'zod';

interface FileTreeItemProps {
  fileName: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onDelete: () => void;
  onClick: () => void;
  onNameChange: (newName: string) => void;
  onDownload: () => void;
  canDelete?: boolean;
  canDownload?: boolean;
}

const FileTreeItem = ({
  fileName,
  icon,
  isSelected,
  onClick,
  onDelete,
  onNameChange: onRename,
  onDownload,
  canDelete,
  canDownload,
}: FileTreeItemProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [textFieldValue, setTextFieldValue] = useState(fileName);
  const fileTreeItemRef = useRef<HTMLDivElement>(null);

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
  }, [isSelected, isRenaming]);

  const handleOnRename = () => {
    setIsRenaming(true);
  };

  const handleOnDownload = () => {
    onDownload();
  };

  const handleOnDelete = () => {
    onDelete();
  };

  const handleOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    if (isRenaming) {
      onRename(textFieldValue);
    }

    setIsRenaming(!isRenaming);
  };

  const handleOnBlur = () => {
    setIsRenaming(false);
    onRename(textFieldValue);
  };

  const handleOnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFieldValue(e.target.value);
  };

  return (
    <div
      className={styles.container}
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
          ref={textFieldRef}
          onKeyUp={(e) => {
            e.stopPropagation();
            handleOnKeyUp(e);
          }}
          autoFocus
        />
      ) : (
        <Text size="1" wrap="nowrap" truncate>
          {fileName}
        </Text>
      )}
      <FileTreeItemDotMenu
        className={styles.dotMenu}
        onRename={handleOnRename}
        onDownload={handleOnDownload}
        onDelete={handleOnDelete}
        canDelete={canDelete}
        canDownload={canDownload}
      />
    </div>
  );
};

export default FileTreeItem;
