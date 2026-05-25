import { IconButton, Popover } from '@radix-ui/themes';
import { LucideOmega, PiIcon } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../../../../shared/components/latex-editor/EditorContext';

export function MathSymbolControls() {
  const [open, setOpen] = useState(false);
  const { insertMathSymbol } = useEditor();

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <IconButton size="1" variant="ghost" title="Math symbols">
          <LucideOmega size={16} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content align="end" onOpenAutoFocus={preventPopoverFocus} onCloseAutoFocus={preventPopoverFocus}>
        <IconButton onClick={() => insertMathSymbol('\\pi')}>
          <PiIcon />
        </IconButton>
      </Popover.Content>
    </Popover.Root>
  );
}
