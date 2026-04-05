import { Checkbox, IconButton, TextField } from '@radix-ui/themes';
import { EyeIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useDocumentCreationFormContext } from '../../form';
import styles from './PasswordProtection.module.css';

type PasswordFieldType = 'password' | 'text';

export function PasswordProtection() {
  const form = useDocumentCreationFormContext();

  const password = form.watch('password');
  const [usePasswordProtection, setUsePasswordProtection] = useState(false);
  const [passwordFieldType, setPasswordFieldType] = useState<PasswordFieldType>('password');

  function togglePasswordReveal() {
    if (passwordFieldType === 'password') {
      setPasswordFieldType('text');
    } else {
      setPasswordFieldType('password');
    }
  }

  function setPasswordProtectionCheckbox(checked: boolean) {
    setUsePasswordProtection(checked);

    if (checked) {
      form.setValue('password', '');
    } else {
      form.resetField('password');
    }
  }

  return (
    <>
      <div className={styles.passwordProtection}>
        <Checkbox
          id="passwordProtection"
          size="3"
          checked={usePasswordProtection}
          onCheckedChange={(checked) => setPasswordProtectionCheckbox(Boolean(checked))}
          data-testid="passwordProtectionCheckbox"
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
            data-testid="passwordField"
            {...form.register('password')}
          >
            <TextField.Slot>
              <LockIcon />
            </TextField.Slot>

            <TextField.Slot side="right" style={{ visibility: password ? 'visible' : 'hidden' }}>
              <IconButton
                variant="ghost"
                type="button"
                onClick={() => togglePasswordReveal()}
                data-testid="revealPasswordButton"
              >
                <EyeIcon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </div>
      )}
    </>
  );
}
