import { DropdownMenu } from '@radix-ui/themes';
import { LucideEllipsisVertical } from 'lucide-react';

interface FileTreeItemDotMenuProps {
  className?: string;
  onRename?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const FileTreeItemDotMenu = ({ className, onRename, onDownload, onDelete }: FileTreeItemDotMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <LucideEllipsisVertical className={className} size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onSelect={(e) => {
            e.stopPropagation();
            onRename?.();
          }}
        >
          Rename
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={(e) => {
            e.stopPropagation();
            onDownload?.();
          }}
        >
          Download
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          color="red"
        >
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default FileTreeItemDotMenu;
