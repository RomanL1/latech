import { TextField } from '@radix-ui/themes';
import styles from './DocumentNameField.module.css';

interface DocumentNameFieldProps {
  onDocumentNameChange: (documentName: string) => unknown;
}

export function DocumentNameField({ onDocumentNameChange }: DocumentNameFieldProps) {
  return (
    <div className={styles.documentName}>
      <label htmlFor="name">Document Name</label>
      <TextField.Root
        id="name"
        size="3"
        placeholder="Untitled document"
        onChange={(event) => onDocumentNameChange(event.target.value)}
        required
      />
    </div>
  );
}
