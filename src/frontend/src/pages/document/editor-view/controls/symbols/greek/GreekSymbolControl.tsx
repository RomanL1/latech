import { Heading, IconButton, Popover } from '@radix-ui/themes';
import { OmegaIcon } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../../../../../shared/components/latex-editor/EditorContext';
import styles from './GreekSymbolControl.module.css';
import { greekSymbols, greekSymbolVariants } from './greek-symbols';

export function GreekSymbolControl() {
  const [open, setOpen] = useState(false);
  const { insertMathSymbol } = useEditor();

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  function insertSymbol(symbol: string) {
    insertMathSymbol(symbol);
    // setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <IconButton size="1" variant="ghost" title="Greek letters">
          <OmegaIcon size={16} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content align="center" onOpenAutoFocus={preventPopoverFocus} onCloseAutoFocus={preventPopoverFocus}>
        <Heading>Greek letters</Heading>
        <div className={styles.grid}>
          {greekSymbols.map(({ symbol, latexSymbol, altText }) => (
            <IconButton
              size="1"
              variant="outline"
              className={styles.cell}
              onClick={() => insertSymbol(latexSymbol)}
              title={altText}
              aria-label={altText}
            >
              {symbol}
            </IconButton>
          ))}
        </div>

        <br />

        <div className={styles.grid}>
          {greekSymbolVariants.map(({ symbol, latexSymbol, altText }) => (
            <IconButton
              size="1"
              variant="outline"
              className={styles.cell}
              onClick={() => insertSymbol(latexSymbol)}
              title={altText}
              aria-label={altText}
            >
              {symbol}
            </IconButton>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
