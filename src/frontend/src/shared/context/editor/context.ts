import { createContext } from 'react';
import type { EditorService } from './EditorProvider';

export const EditorContext = createContext<EditorService | null>(null);
