import styles from './CreateDocumentPage.module.css';
import { CreateDocumentSidebar } from './sidebar/CreateDocumentSidebar';

export function CreateDocumentPage() {
  return (
    <form className={styles.form}>
      <div className={styles.sidebar}>
        <CreateDocumentSidebar />
      </div>
      <div className={styles.templates}>templates</div>
    </form>
  );
}
