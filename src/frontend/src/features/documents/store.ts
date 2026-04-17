import type { DocumentMetadata } from './document';

const STORAGE_KEY = 'local_documents';

const fakeDocuments: DocumentMetadata[] = [
  { documentId: '123', name: 'Bachelor Thesis', lastEdited: new Date() },
  { documentId: '456', name: 'Master Thesis', lastEdited: new Date() },
  { documentId: '789', name: 'Cover Letter', lastEdited: new Date() },
];

export function getLocalDocuments(): DocumentMetadata[] {
  const documentsJson = localStorage.getItem(STORAGE_KEY)!;
  const documents = (JSON.parse(documentsJson) || fakeDocuments) as DocumentMetadata[];

  return documents.map((document) => ({
    ...document,
    lastEdited: new Date(document.lastEdited),
  }));
}

export function storeDocument(document: DocumentMetadata) {
  const localDocuments = getLocalDocuments();
  const index = localDocuments.findIndex((item) => item.documentId === document.documentId);

  if (index === -1) {
    localDocuments.push(document);
  } else {
    localDocuments[index] = document;
  }

  const documentsJson = JSON.stringify(localDocuments);
  localStorage.setItem(STORAGE_KEY, documentsJson);
}
