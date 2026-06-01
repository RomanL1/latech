import { Button } from '@radix-ui/themes';
import { useContext, type MouseEvent, type PropsWithChildren } from 'react';
import { NonFocusStealingDropdownContext } from './NonFocusStealingDropdownContext';

type NonFocusStealingDropdownOptionProps = PropsWithChildren<{
  value: string;
}>;

export function NonFocusStealingDropdownOption({ children, value }: NonFocusStealingDropdownOptionProps) {
  const dropdown = useContext(NonFocusStealingDropdownContext);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    dropdown?.onOptionSelected(value);
  }

  return (
    <Button variant="ghost" onClick={(event) => handleClick(event)} style={{ justifyContent: 'flex-start' }}>
      {children}
    </Button>
  );
}
