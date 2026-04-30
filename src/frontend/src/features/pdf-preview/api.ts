import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document/`;

//post trigger PDF render
export async function requestPDFRender(docId: string): Promise<void> {
  return fetch(`${documentUrl}${docId}/render`, { method: 'POST' })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to initiate render');
    })
    .catch(() => {
      throw new Error('Failed to initiate render');
    });
}

export function useRequestPDFRender(docId: string): UseMutationResult<void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestPDFRender(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf', docId] });
    },
  });
}

//get PDF as file
export async function getPDF(docId: string): Promise<Blob | null> {
  const response = await fetch(`${documentUrl}${docId}/render`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch PDF');
  }

  return response.blob();
}

export function useGetRenderedPDF(docId: string): UseQueryResult<Blob | null> {
  return useQuery({
    queryKey: ['pdf', docId],
    queryFn: () => getPDF(docId),
  });
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
