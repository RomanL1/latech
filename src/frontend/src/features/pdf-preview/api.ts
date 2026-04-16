import { useQuery } from '@tanstack/react-query';

const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document/`;

export function requestPDFRender(docId: string): Promise<void> {
  return fetch(`${documentUrl}${docId}/render`, { method: 'POST' })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to initiate render');
    })
    .catch(() => Promise.resolve<void>(undefined));
}

export function getRenderedPDF(docId: string): Promise<Blob> {
  return fetch(`${documentUrl}${docId}/render`).then((res) => res.blob());
}

export function usePDFRenderQuery() {
  return useQuery({
    queryKey: ['pdfrender'],
    queryFn: requestPDFRender,
  });
}

export function getPDFRenderedEventSource(docId: string): EventSource {
  return new EventSource(`${documentUrl}${docId}/stream-updates`);
}
