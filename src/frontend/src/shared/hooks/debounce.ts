import { useRef, useCallback } from 'react';

export function useDebouncedCallback<TCallback extends (...args: never[]) => void>(
  callbackFn: TCallback,
  delayInMilliseconds: number,
) {
  const timeoutRef = useRef<number | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<TCallback>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackFn(...args);
      }, delayInMilliseconds);
    },
    [callbackFn, delayInMilliseconds],
  );

  return debouncedFn;
}
