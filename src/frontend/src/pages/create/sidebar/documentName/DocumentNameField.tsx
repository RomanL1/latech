import { TextField } from '@radix-ui/themes';
import { useDebouncedCallback } from '../../../../shared/hooks/debounce';
import styles from './DocumentNameField.module.css';

interface DocumentNameFieldProps {
  onDocumentNameChange: (documentName: string) => unknown;
}

export function DocumentNameField({ onDocumentNameChange }: DocumentNameFieldProps) {
  const debouncedChangeHandler = useDebouncedCallback((newDocumentName: string) => {
    onDocumentNameChange(newDocumentName);
  }, 200);

  return (
    <div className={styles.documentName}>
      <label htmlFor="name">Document Name</label>
      <TextField.Root
        id="name"
        size="3"
        placeholder="Untitled document"
        onChange={(event) => debouncedChangeHandler(event.target.value)}
        data-testid="documentNameField"
        required
      />
    </div>
  );
}
