import styles from './FileTreeItem.module.css';
import { Text, TextField } from '@radix-ui/themes';
import type { SampleFile } from '../../sampleData';
import FileTreeItemDotMenu from './dot-menu/FileTreeItemDotMenu';
import { useEffect, useRef, useState } from 'react';

interface FileTreeItemProps {
  file: SampleFile;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  onRename?: (newName: string) => void;
}

const FileTreeItem = ({ file, icon, isSelected, onClick, onRename }: FileTreeItemProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [textFieldValue, setTextFieldValue] = useState(file.name);
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
  });

  const handleOnRename = () => {
    console.log('Rename', file);
    setIsRenaming(true);
  };

  const handleOnDownload = () => {
    console.log('Download', file);
  };

  const handleOnDelete = () => {
    console.log('Delete', file);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent) => {
    console.log('KEY UP', e.key);
    if (e.key !== 'Enter') return;

    if (isRenaming) {
      onRename?.(textFieldValue);
    }

    setIsRenaming(!isRenaming);
  };

  const handleOnBlur = () => {
    setIsRenaming(false);
    onRename?.(textFieldValue);
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
      {icon}
      {isRenaming ? (
        <TextField.Root
          className={styles.textField}
          size="1"
          value={textFieldValue}
          onChange={(e) => setTextFieldValue(e.target.value)}
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
        <Text size="1" wrap="nowrap">
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
