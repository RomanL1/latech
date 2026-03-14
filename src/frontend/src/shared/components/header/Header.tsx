import styles from './Header.module.css';
import { FileBracesCornerIcon } from 'lucide-react';

export function Header() {
  return (
    <header className={styles.header}>
      <FileBracesCornerIcon size={36} className={styles.icon} />
      <h1 className={styles.appName}>LaTeCH</h1>
      <h3 className={styles.documentName}>/ Bachelor thesis</h3>
    </header>
  );
}
