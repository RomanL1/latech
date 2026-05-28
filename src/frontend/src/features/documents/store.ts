import type { DocumentMetadata } from './document';

const STORAGE_KEY = 'local_documents';

export function getLocalDocuments(): DocumentMetadata[] {
  const documentsJson = localStorage.getItem(STORAGE_KEY)!;
  const documents = (JSON.parse(documentsJson) || []) as DocumentMetadata[];

  return documents.map((document) => ({
    ...document,
    lastEdited: new Date(document.lastEdited),
  }));
}

export function updateDocuments(documents: DocumentMetadata[]) {
  const documentsJson = JSON.stringify(documents);
  localStorage.setItem(STORAGE_KEY, documentsJson);
}

export function storeDocument(document: DocumentMetadata) {
  const localDocuments = getLocalDocuments();
  const index = localDocuments.findIndex((item) => item.documentId === document.documentId);

  if (index === -1) {
    localDocuments.push(document);
  } else {
    localDocuments[index] = document;
  }

  updateDocuments(localDocuments);
}

export function removeDocument(documentId: string): boolean {
  const localDocuments = getLocalDocuments();
  const newDocuments = localDocuments.filter((item) => item.documentId !== documentId);

  const wasRemoved = localDocuments.length > newDocuments.length;

  updateDocuments(newDocuments);

  return wasRemoved;
}
