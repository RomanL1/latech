import { IconButton, Popover } from '@radix-ui/themes';
import { LucideTable } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../../../../shared/components/latex-editor/EditorContext';
import styles from './TableControl.module.css';

interface TableCell {
  row: number;
  column: number;
}

export function TableControl() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<TableCell | null>(null);
  const { insertTable } = useEditor();

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  function createTable(rows: number, columns: number) {
    insertTable({ rows, columns });
    setOpen(false);
  }

  const size = 8;
  const buttons = Array.from({ length: size ** 2 }, (_, index) => {
    const row = Math.floor(index / size) + 1;
    const column = (index % size) + 1;

    const active = hovered && row <= hovered.row && column <= hovered.column;
    const key = `${row}-${column}`;

    return (
      <button
        key={key}
        className={`${styles.cell} ${active ? styles.active : ''}`}
        onClick={() => createTable(row, column)}
        onMouseEnter={() => setHovered({ row, column })}
        onMouseLeave={() => setHovered(null)}
      />
    );
  });

  const dimensionText = hovered ? `${hovered.row}x${hovered.column}` : '';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <IconButton size="1" variant="ghost" title="Insert table">
          <LucideTable size={16} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content onOpenAutoFocus={preventPopoverFocus} onCloseAutoFocus={preventPopoverFocus}>
        <span>Table {dimensionText}</span>
        <div className={styles.grid}>{buttons}</div>
      </Popover.Content>
    </Popover.Root>
  );
}
