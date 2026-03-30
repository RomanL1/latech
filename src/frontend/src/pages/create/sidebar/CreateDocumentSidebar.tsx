import { Button } from '@radix-ui/themes';
import { FilePlusCornerIcon } from 'lucide-react';
import { useState } from 'react';
import type { DocumentTemplate } from '../../../features/templates/template';
import styles from './CreateDocumentSidebar.module.css';
import type { DocumentCredentials } from './credentials';
import { DocumentNameField } from './documentName/DocumentNameField';
import { PasswordProtection } from './password/PasswordProtection';
import { SelectedTemplate } from './selectedTemplate/SelectedTemplate';

interface CreateDocumentSidebarProps {
  selectedTemplate: DocumentTemplate | null;
  onSubmit: (dc: DocumentCredentials) => unknown;
}

export function CreateDocumentSidebar({ selectedTemplate, onSubmit }: CreateDocumentSidebarProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState<string | null>(null);

  function handleSubmit() {
    onSubmit({ name, password });
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Document</h2>
      <DocumentNameField onDocumentNameChange={(name) => setName(name)} />
      <PasswordProtection onPasswordChange={(pw) => setPassword(pw)} />
      <div className={styles.spacer}></div>

      <SelectedTemplate template={selectedTemplate} />

      <div className={styles.actions}>
        <Button size="3" className={styles.createButton} onClick={() => handleSubmit()}>
          <FilePlusCornerIcon />
          Create document
        </Button>
      </div>
    </div>
  );
}
