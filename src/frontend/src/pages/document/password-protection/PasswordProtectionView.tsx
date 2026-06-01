import { Button, Card, Text, TextField } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { useUnlockDocument } from '../../../features/documents/api';
import styles from './PasswordProtectionView.module.css';
import { LockIcon, LucideLock } from 'lucide-react';

interface PasswordProtectionViewProps {
  documentId?: string;
}

const PasswordProtectionView = ({ documentId }: PasswordProtectionViewProps) => {
  const unlockMutation = useUnlockDocument(documentId ?? '');
  const [password, setPassword] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleUnlock = async () => {
    if (!password.trim()) return;
    try {
      await unlockMutation.mutateAsync(password);
      setPassword('');
    } catch {
      // keep password so user can correct and retry
    }
  };

  return (
    <div className={styles.container}>
      <Card size="3" className={styles.card}>
        <div className={styles.iconContainer}>
          <LucideLock size={60} className={styles.icon} />
          <Text size="4" weight="bold">
            Protected document
          </Text>
        </div>
        <Text size="2" color="gray">
          Enter the password to access this document
        </Text>
        <TextField.Root
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              buttonRef.current?.click();
            }
          }}
        >
          <TextField.Slot>
            <LockIcon size={18} />
          </TextField.Slot>
        </TextField.Root>
        <Button onClick={handleUnlock} disabled={unlockMutation.isPending || !password.trim()} ref={buttonRef}>
          {unlockMutation.isPending ? 'Unlocking...' : 'Unlock'}
        </Button>
        {unlockMutation.isError ? (
          <Text size="2" color="red">
            {unlockMutation.error?.message ?? 'Wrong password or access denied.'}
          </Text>
        ) : null}
      </Card>
    </div>
  );
};

export default PasswordProtectionView;
