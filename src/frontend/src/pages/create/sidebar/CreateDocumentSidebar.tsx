import { Button } from '@radix-ui/themes';
import { FilePlusCornerIcon } from 'lucide-react';
import { useState } from 'react';
import styles from './CreateDocumentSidebar.module.css';
import { DocumentNameField } from './documentName/DocumentNameField';
import { PasswordProtection } from './password/PasswordProtection';
import { SelectedTemplate } from './selectedTemplate/SelectedTemplate';

export function CreateDocumentSidebar() {
  const [documentName, setDocumentName] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit() {
    console.log(documentName);
    console.log(password);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Document</h2>
      <DocumentNameField onDocumentNameChange={(name) => setDocumentName(name)} />
      <PasswordProtection onPasswordChange={(pw) => setPassword(pw)} />
      <div className={styles.spacer}></div>

      <SelectedTemplate />
      <div className={styles.actions}>
        <Button size="3" type="button" className={styles.createButton} onClick={() => onSubmit()}>
          <FilePlusCornerIcon />
          Create document
        </Button>
      </div>
    </div>
  );
}
