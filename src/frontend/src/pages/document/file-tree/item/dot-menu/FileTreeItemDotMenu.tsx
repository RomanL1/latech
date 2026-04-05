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
          onSelect={() => {
            onRename?.();
          }}
          shortcut="Enter"
        >
          Rename
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => {
            onDownload?.();
          }}
        >
          Download
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => {
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
