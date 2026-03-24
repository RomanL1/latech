import { getLocalDocuments } from '../../features/documents/store';
import { DocumentGrid } from './documents/DocumentGrid';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const documents = getLocalDocuments();

  return (
    <div className={styles.container}>
      <h2>Your documents</h2>
      <DocumentGrid documents={documents} />
    </div>
  );
}
