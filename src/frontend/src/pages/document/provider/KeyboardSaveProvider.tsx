import { useEffect, useRef } from 'react';
import { KeyboardSaveContext } from './KeyboardSaveContext';

const KeyboardSaveProvider = ({ children }: { children: React.ReactNode }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const triggerSave = () => {
    buttonRef.current?.click();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSaveShortcutClicked = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';

      if (isSaveShortcutClicked) {
        e.preventDefault();
        triggerSave();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <KeyboardSaveContext.Provider
      value={{
        buttonRef: buttonRef as React.RefObject<HTMLButtonElement>,
        triggerSave,
      }}
    >
      {children}
    </KeyboardSaveContext.Provider>
  );
};

export default KeyboardSaveProvider;
