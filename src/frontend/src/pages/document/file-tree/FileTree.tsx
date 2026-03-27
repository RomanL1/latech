import { Button, Flex, Text } from '@radix-ui/themes';
import { LucideDroplets, LucideEllipsisVertical, LucideFolder, Upload } from 'lucide-react';
import styles from './FileTree.module.css';
import { sampleData } from '../sampleData';

const FileTree = () => {
  return (
    <Flex direction="column" gap="2">
      <Flex direction="row" gap="3">
        <Text size="5" wrap="nowrap">
          File Tree
        </Text>
        <Button className={styles.headerButton}>
          <Upload />
          Upload Image
        </Button>
        <Button className={styles.headerButton}>
          <LucideFolder />
          New Folder
        </Button>
      </Flex>
      <div className={styles.imageList}>
        {sampleData.map((item) => (
          <div className={styles.imageItem} key={item.id}>
            <Text size="3" wrap="nowrap" className={styles.imageItem}>
              {item.name}
            </Text>
            <LucideEllipsisVertical className={styles.dotMenu} />
          </div>
        ))}
      </div>
    </Flex>
  );
};

export default FileTree;
