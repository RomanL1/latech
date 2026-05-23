import { createContext, useContext } from "react";


interface KeyboardSaveContextValue {
  buttonRef: React.RefObject<HTMLButtonElement>;
  triggerSave: () => void;
}

export const KeyboardSaveContext = createContext<KeyboardSaveContextValue | null>(null);

export function useKeyboardSaveContext() {
  const value = useContext(KeyboardSaveContext);

  if (!value) {
    throw new Error('useKeyboardSaveContext must be used within a KeyboardSaveProvider');
  }

  return value;
}