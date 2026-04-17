import type { DocumentCreation } from './document';
import { storeDocument } from './store';

const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document`;

interface CreateDocumentResponse {
  documentId: string;
  name: string;
}

export function saveTemplate(document: DocumentCreation): Promise<CreateDocumentResponse> {
  const request = fetch(documentUrl, {
    method: 'POST',
    body: JSON.stringify(document),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return request
    .then((response) => response.json() as Promise<CreateDocumentResponse>)
    .then((document) => {
      storeDocument({
        documentId: document.documentId,
        name: document.name,
        lastEdited: new Date(),
      });

      return document;
    });
}
