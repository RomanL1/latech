import { Checkbox, IconButton, TextField } from '@radix-ui/themes';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';
import styles from './CreateDocumentForm.module.css';

export function CreateDocumentForm() {
  return (
    <div className={styles.form}>
      <DocumentNameField />
      <PasswordProtection />
    </div>
  );
}

function DocumentNameField() {
  return (
    <div className={styles.documentName}>
      <label htmlFor="name">Document Name</label>
      <TextField.Root id="name" size="3" placeholder="Untitled document" />
    </div>
  );
}

type PasswordFieldType = 'password' | 'text';

function PasswordProtection() {
  const [usePasswordProtection, setUsePasswordProtection] = useState(false);
  const [passwordFieldType, setPasswordFieldType] = useState<PasswordFieldType>('password');

  function togglePasswordVisibility() {
    if (passwordFieldType === 'password') {
      setPasswordFieldType('text');
    } else {
      setPasswordFieldType('password');
    }
  }

  return (
    <>
      <div className={styles.passwordProtection}>
        <Checkbox
          id="passwordProtection"
          size="3"
          onCheckedChange={(checked) => setUsePasswordProtection(Boolean(checked))}
        />
        <label htmlFor="passwordProtection">Use password protection</label>
      </div>

      {usePasswordProtection && (
        <div className={styles.password}>
          <label htmlFor="password">Password</label>
          <TextField.Root
            id="password"
            size="3"
            type={passwordFieldType}
            placeholder="My secret password"
            autoComplete="off"
          >
            <TextField.Slot side="right">
              <IconButton variant="ghost" type="button" onClick={() => togglePasswordVisibility()}>
                <EyeIcon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </div>
      )}
    </>
  );
}
