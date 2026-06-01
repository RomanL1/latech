import { createContext } from 'react';

export const NonFocusStealingDropdownContext = createContext<{
  onOptionSelected: (value: string) => void;
} | null>(null);
