import { Popover } from '@radix-ui/themes';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import styles from './NonFocusStealingDropdown.module.css';
import { NonFocusStealingDropdownContext } from './NonFocusStealingDropdownContext';

type NonFocusStealingDropdownProps = PropsWithChildren<{
  trigger: ReactNode;
  onOptionSelected: (value: string) => unknown;
}>;

/**
 * This custom select control won't take over focus
 * when interacted with, unlike any other select/dropdown implementation
 */
export function NonFocusStealingDropdownRoot({ trigger, children, onOptionSelected }: NonFocusStealingDropdownProps) {
  const [open, setOpen] = useState(false);

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  function handleOptionClick(value: string) {
    onOptionSelected(value);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>{trigger}</Popover.Trigger>
      <Popover.Content
        className={styles.popoverContent}
        onOpenAutoFocus={preventPopoverFocus}
        onCloseAutoFocus={preventPopoverFocus}
      >
        <NonFocusStealingDropdownContext.Provider value={{ onOptionSelected: handleOptionClick }}>
          {children}
        </NonFocusStealingDropdownContext.Provider>
      </Popover.Content>
    </Popover.Root>
  );
}
