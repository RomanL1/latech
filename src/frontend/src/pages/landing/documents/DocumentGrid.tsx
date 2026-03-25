import { Link } from 'react-router';
import type { DocumentMetadata } from '../../../features/documents/document';
import styles from './DocumentGrid.module.css';
import { CreateDocumentButton } from './create-document-button/CreateDocumentButton';
import { DocumentCard } from './document-card/DocumentCard';

export interface DocumentGridProps {
  documents: DocumentMetadata[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  const orderedDocuments = orderByLastEditedDescending(documents);

  return (
    <ul className={styles.grid}>
      <Link to="/create" className={styles.link} data-testid="createDocumentButton" role="button">
        <CreateDocumentButton />
      </Link>
      <DocumentGridItems documents={orderedDocuments} />
    </ul>
  );
}

function DocumentGridItems({ documents }: DocumentGridProps) {
  return documents.map((document) => (
    <Link
      role="listitem"
      key={document.documentId}
      to={`/document/${document.documentId}`}
      className={`${styles.gridItem} ${styles.link}`}
      data-testid={`document-${document.documentId}`}
    >
      <DocumentCard document={document} />
    </Link>
  ));
}

function orderByLastEditedDescending(documents: DocumentMetadata[]) {
  return [...documents].sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime());
}
