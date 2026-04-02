import { LucideEllipsisVertical } from 'lucide-react';

import styles from './FileTreeItem.module.css';
import { Text } from '@radix-ui/themes';
import type { SampleFile } from '../../sampleData';

interface FileTreeItemProps {
  file: SampleFile;
  onClick: () => void;
  icon: React.ReactNode;
  isSelected: boolean;
}

const FileTreeItem = ({ file, onClick, icon, isSelected }: FileTreeItemProps) => {
  return (
    <div className={styles.container} key={file.id} onClick={onClick} data-selected={isSelected}>
      {icon}
      <Text size="1" wrap="nowrap">
        {file.name}
      </Text>
      <LucideEllipsisVertical className={styles.dotMenu} size={16} />
    </div>
  );
};

export default FileTreeItem;
