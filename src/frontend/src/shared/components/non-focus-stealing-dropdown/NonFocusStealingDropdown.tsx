import { Button, Popover } from '@radix-ui/themes';
import type { PropsWithChildren } from 'react';
import { Children, cloneElement, isValidElement, useState } from 'react';

type NonFocusStealingDropdownProps = PropsWithChildren<{
  name: string;
  onOptionSelected: (value: string | number) => unknown;
}>;

/**
 * This custom select control won't take over focus
 * when interacted with, unlike any other select/dropdown implementation
 */
export function NonFocusStealingDropdown({ name, children, onOptionSelected }: NonFocusStealingDropdownProps) {
  const [open, setOpen] = useState(false);

  function preventPopoverFocus(event: Event) {
    event.preventDefault();
  }

  function handleOptionClick(value: string | number) {
    onOptionSelected(value);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button variant="soft" size="1">
          {name}
        </Button>
      </Popover.Trigger>
      <Popover.Content onOpenAutoFocus={preventPopoverFocus} onCloseAutoFocus={preventPopoverFocus}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child;
          }

          return cloneElement(child as NonFocusStealingDropdownOptionElement, {
            onOptionSelected: handleOptionClick,
          });
        })}
      </Popover.Content>
    </Popover.Root>
  );
}

type InjectedOptionProps = {
  onOptionSelected?: (value: string | number) => void;
};

type NonFocusStealingDropdownOptionProps = PropsWithChildren<{
  value: string | number;
}>;

type NonFocusStealingDropdownOptionElement = React.ReactElement<
  NonFocusStealingDropdownOptionProps & InjectedOptionProps
>;

function NonFocusStealingDropdownOption({
  children,
  value,
  onOptionSelected,
}: NonFocusStealingDropdownOptionProps & InjectedOptionProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    onOptionSelected?.(value);
  }

  return (
    <Button variant="ghost" onClick={(event) => handleClick(event)} style={{ justifyContent: 'flex-start' }}>
      {children}
    </Button>
  );
}

NonFocusStealingDropdown.Option = NonFocusStealingDropdownOption;
