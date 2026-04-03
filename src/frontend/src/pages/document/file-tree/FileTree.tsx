import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { FileCodeCorner, LucideFile, LucideX, Upload } from 'lucide-react';
import styles from './FileTree.module.css';
import { sampleData, type SampleFile } from '../sampleData';
import FileTreeItem from './item/FileTreeItem';

interface FileTreeProps {
  setSelectedFile: (file?: SampleFile) => void;
  selectedFile?: SampleFile;
  onClose?: () => void;
}

const FileTree = ({ selectedFile, setSelectedFile, onClose }: FileTreeProps) => {
  return (
    <Flex direction="column" gap="3">
      <div className={styles.header}>
        <Text size="5" wrap="nowrap">
          File Tree
        </Text>
        <Button className={styles.headerButton}>
          <Upload size={20} />
          Upload Image
        </Button>
        <IconButton className={styles.headerButton} onClick={onClose}>
          <LucideX size={16} />
        </IconButton>
      </div>
      <div className={styles.imageList}>
        {sampleData.map((item) => (
          <FileTreeItem
            key={item.id}
            file={item}
            onClick={() => setSelectedFile(item)}
            icon={item.type == 'image/jpeg' ? <LucideFile size={20} /> : <FileCodeCorner size={20} />}
            isSelected={selectedFile?.id === item.id}
          />
        ))}
      </div>
    </Flex>
  );
};

export default FileTree;
