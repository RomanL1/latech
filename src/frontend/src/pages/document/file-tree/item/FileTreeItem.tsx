import styles from './FileTreeItem.module.css';
import { Text, TextField } from '@radix-ui/themes';
import type { SampleFile } from '../../sampleData';
import FileTreeItemDotMenu from './dot-menu/FileTreeItemDotMenu';
import { useEffect, useRef, useState } from 'react';

interface FileTreeItemProps {
  file: SampleFile;
  onClick: () => void;
  icon: React.ReactNode;
  isSelected: boolean;
}

const FileTreeItem = ({ file, onClick, icon, isSelected }: FileTreeItemProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [textFieldValue, setTextFieldValue] = useState(file.name);

  useEffect(() => {
    console.log('isRenaming changed', isRenaming);
    if (isRenaming) {
      textFieldRef.current?.focus();
      textFieldRef.current?.select();
      console.log(textFieldRef.current);
      console.log('FOCUS');
    }
  }, [isRenaming]);

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
    if (e.key === 'Enter') {
      console.log('Enter pressed');
      setIsRenaming(false);
    }
  };

  return (
    <div
      className={styles.container}
      key={file.id}
      onClick={() => {
        console.log('Clicked on file', file);
        onClick();
      }}
      data-selected={isSelected}
    >
      {icon}
      {isRenaming ? (
        <TextField.Root
          className={styles.textField}
          size="1"
          value={textFieldValue}
          onChange={(e) => setTextFieldValue(e.target.value)}
          onBlur={() => {
            console.log('Blur');
            setIsRenaming(false);
          }}
          onFocus={() => console.log('FOCUS')}
          ref={textFieldRef}
          autoFocus={true}
          onClick={(e) => e.stopPropagation()}
          onKeyUp={handleOnKeyUp}
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
