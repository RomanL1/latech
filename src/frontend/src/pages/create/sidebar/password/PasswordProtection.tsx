import { Checkbox, IconButton, TextField } from '@radix-ui/themes';
import { EyeIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import styles from './PasswordProtection.module.css';
import { useDebouncedCallback } from '../../../../shared/hooks/debounce';

type PasswordFieldType = 'password' | 'text';

interface PasswordProtectionProps {
  onPasswordChange: (password: string | null) => unknown;
}

export function PasswordProtection({ onPasswordChange }: PasswordProtectionProps) {
  const [password, setPassword] = useState<string | null>(null);
  const [usePasswordProtection, setUsePasswordProtection] = useState(false);
  const [passwordFieldType, setPasswordFieldType] = useState<PasswordFieldType>('password');

  const debouncedChangeHandler = useDebouncedCallback((newPassword: string | null) => {
    onPasswordChange(newPassword);
  }, 200);

  function handlePasswordChange(newPassword: string) {
    setPassword(newPassword || null);
    debouncedChangeHandler(newPassword || null);
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
          checked={usePasswordProtection}
          onCheckedChange={(checked) => setUsePasswordProtection(Boolean(checked))}
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
            onChange={(event) => handlePasswordChange(event.target.value)}
            data-testid="passwordField"
            required
            minLength={8}
            pattern="^(?=.*[^A-Za-z0-9]).{8,}$"
          >
            <TextField.Slot>
              <LockIcon />
            </TextField.Slot>

            <TextField.Slot side="right" style={{ visibility: password ? 'visible' : 'hidden' }}>
              <IconButton
                variant="ghost"
                type="button"
                onClick={() => togglePasswordVisibility()}
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
