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

export const COMPILE_FINISHED_MESSAGE_TYPE = 'compile-finished';

export interface PDFReadyMessageDto {
  docId: string;
  success: boolean;
  logMessage: string | null;
  downloadPath: string | null;
  timestampUTC: number;
}

export interface RenderHistoryDto {
  id: string;
  documentId: string;
  renderId: string;
  status: string;
  logMessage: string;
  renderedAt: string;
}

export function getRenderHistory(docId: string): Promise<RenderHistoryDto[]> {
  return fetch(`${documentUrl}${docId}/history`).then((res) => res.json());
}
