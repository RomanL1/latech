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
      <li data-testid="createDocumentButton" role="button">
        <CreateDocumentButton />
      </li>
      <DocumentGridItems documents={orderedDocuments} />
    </ul>
  );
}

function DocumentGridItems({ documents }: DocumentGridProps) {
  return documents.map((document) => (
    <li
      key={document.documentId}
      className={styles.gridItem}
      role="listitem"
      data-testid={`document-${document.documentId}`}
    >
      <DocumentCard document={document} />
    </li>
  ));
}

function orderByLastEditedDescending(documents: DocumentMetadata[]) {
  return [...documents].sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime());
}
