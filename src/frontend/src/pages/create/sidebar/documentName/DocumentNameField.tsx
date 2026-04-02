import { TextField } from '@radix-ui/themes';
import { useDocumentCreationFormContext } from '../../form';
import styles from './DocumentNameField.module.css';

export function DocumentNameField() {
  const form = useDocumentCreationFormContext();

  return (
    <div className={styles.documentName}>
      <label htmlFor="name">Document Name</label>
      <TextField.Root
        id="name"
        size="3"
        placeholder="Untitled document"
        data-testid="documentNameField"
        {...form.register('documentName')}
      />
    </div>
  );
}
