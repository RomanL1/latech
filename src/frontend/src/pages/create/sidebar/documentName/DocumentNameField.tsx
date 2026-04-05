import { TextField } from '@radix-ui/themes';
import { useDocumentCreationFormContext } from '../../form';

export function DocumentNameField() {
  const form = useDocumentCreationFormContext();

  return (
    <div>
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
