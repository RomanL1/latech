const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document/`;

//post trigger PDF render
export function requestPDFRender(docId: string): Promise<void> {
  return fetch(`${documentUrl}${docId}/render`, { method: 'POST' })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to initiate render');
    })
    .catch(() => Promise.resolve<void>(undefined));
}

//get PDF as file
export function getRenderedPDF(docId: string): Promise<Blob> {
  return fetch(`${documentUrl}${docId}/render`).then((res) => res.blob());
}

//get event source for PDF render status
export function getPDFRenderedEventSource(docId: string): EventSource {
  return new EventSource(`${documentUrl}${docId}/stream-updates`);
}

export const PDF_READY_MESSAGE_TYPE = 'pdf-ready';

export interface PDFReadyMessageDto {
  docId: string;
  success: boolean;
  errorMessage: string | null;
  downloadPath: string | null;
  timestampUTC: number;
}
