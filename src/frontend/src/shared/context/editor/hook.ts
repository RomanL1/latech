import { useContext } from 'react';
import { EditorContext } from './context';

export function useEditorService() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditorService must be used inside EditorProvider');
  }

  return context;
}
