import { Button } from '@radix-ui/themes';
import { FilePlusCornerIcon } from 'lucide-react';
import type { DocumentTemplate } from '../../../features/templates/template';
import { useDocumentCreationFormContext } from '../form';
import styles from './CreateDocumentSidebar.module.css';
import { DocumentNameField } from './documentName/DocumentNameField';
import { PasswordProtection } from './password/PasswordProtection';
import { SelectedTemplate } from './selectedTemplate/SelectedTemplate';

interface CreateDocumentSidebarProps {
  selectedTemplate: DocumentTemplate | null;
  onSubmit: () => unknown;
}

export function CreateDocumentSidebar({ selectedTemplate, onSubmit }: CreateDocumentSidebarProps) {
  const form = useDocumentCreationFormContext();

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Document</h2>
      <DocumentNameField />
      <PasswordProtection />
      <div className={styles.spacer}></div>

      <SelectedTemplate template={selectedTemplate} />

      <div className={styles.actions}>
        <Button
          size="3"
          type="button"
          className={styles.createButton}
          onClick={onSubmit}
          disabled={!form.formState.isValid}
        >
          <FilePlusCornerIcon />
          Create document
        </Button>
      </div>
    </div>
  );
}
