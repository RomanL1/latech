import { useState } from 'react';
import { getLocalDocuments, removeDocument } from '../../features/documents/store';
import { DocumentGrid } from './documents/DocumentGrid';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const [documents, setDocuments] = useState(getLocalDocuments);

  function handleRemoveDocument(documentId: string) {
    const wasRemoved = removeDocument(documentId);

    if (wasRemoved) {
      setDocuments(getLocalDocuments());
    }
  }

  return (
    <div className={styles.container}>
      <h2>Your documents</h2>
      <DocumentGrid documents={documents} onRemoveDocument={handleRemoveDocument} />
    </div>
  );
}
