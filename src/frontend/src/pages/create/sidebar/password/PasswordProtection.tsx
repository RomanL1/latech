import { Checkbox, IconButton, TextField } from '@radix-ui/themes';
import { EyeIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import styles from './PasswordProtection.module.css';

type PasswordFieldType = 'password' | 'text';

interface PasswordProtectionProps {
  onPasswordChange: (password: string) => unknown;
}

export function PasswordProtection({ onPasswordChange }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [usePasswordProtection, setUsePasswordProtection] = useState(false);
  const [passwordFieldType, setPasswordFieldType] = useState<PasswordFieldType>('password');

  function handlePasswordChange(newPassword: string) {
    setPassword(newPassword);
    onPasswordChange(newPassword);
  }

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
            onChange={(event) => handlePasswordChange(event.target.value)}
          >
            <TextField.Slot>
              <LockIcon />
            </TextField.Slot>

            <TextField.Slot side="right" style={{ visibility: password ? 'visible' : 'hidden' }}>
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
