import { Card } from '@radix-ui/themes';
import { PlusIcon } from 'lucide-react';
import styles from './CreateDocumentButton.module.css';

export function CreateDocumentButton() {
  return (
    <Card className={styles.card}>
      <div className={styles.circle}>
        <PlusIcon size={60} className={styles.icon} />
      </div>
      <span className={styles.text}>New Document</span>
    </Card>
  );
}
