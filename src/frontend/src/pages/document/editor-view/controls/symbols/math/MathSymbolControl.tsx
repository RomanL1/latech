import { Heading, IconButton, Popover } from '@radix-ui/themes';
import { RadicalIcon } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../../../../../shared/components/latex-editor/EditorContext';
import styles from './MathSymbolControl.module.css';
import { arrows, calculusAnalysis, logic, operators, relations, setTheory } from './math-symbols';

export function MathSymbolControls() {
  const [open, setOpen] = useState(false);
  const { insertMathSymbol } = useEditor();

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  function insertSymbol(symbol: string) {
    insertMathSymbol(symbol);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <IconButton size="1" variant="ghost" title="Math symbols">
          <RadicalIcon size={16} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content align="center" onOpenAutoFocus={preventPopoverFocus} onCloseAutoFocus={preventPopoverFocus}>
        <Heading>Mathematical Symbols</Heading>
        <span>Basic operators</span>
        <div className={styles.grid}>
          {operators.map(({ symbol, latexSymbol, altText }) => (
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

        <span>Relations</span>
        <div className={styles.grid}>
          {relations.map(({ symbol, latexSymbol, altText }) => (
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

        <span>Arrows</span>
        <div className={styles.grid}>
          {arrows.map(({ symbol, latexSymbol, altText }) => (
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

        <span>Set theory</span>
        <div className={styles.grid}>
          {setTheory.map(({ symbol, latexSymbol, altText }) => (
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

        <span>Logic</span>
        <div className={styles.grid}>
          {logic.map(({ symbol, latexSymbol, altText }) => (
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

        <span>Calculus and analysis</span>
        <div className={styles.grid}>
          {calculusAnalysis.map(({ symbol, latexSymbol, altText }) => (
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
