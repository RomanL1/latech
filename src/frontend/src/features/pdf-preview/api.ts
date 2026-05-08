import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document/`;

function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
    },
  });
}

// post trigger PDF render
export async function requestPDFRender(docId: string): Promise<void> {
  const response = await apiFetch(`${documentUrl}${docId}/render`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to initiate render');
  }
}

export function useRequestPDFRender(docId: string): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => requestPDFRender(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf', docId] });
    },
  });
}

// get PDF as file
export async function getPDF(docId: string): Promise<Blob | null> {
  const response = await apiFetch(`${documentUrl}${docId}/render`);

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

export class ResilientEventSource {
  private url: string;
  private eventSource: EventSource | null = null;
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  private reconnectTimeout: number = 1000;
  private maxReconnectTimeout: number = 30000;
  private closed: boolean = false;
  private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;

  public onopen: (() => void) | null = null;
  public onerror: ((error: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    if (this.closed) return;

    this.eventSource = new EventSource(this.url, {
      withCredentials: true,
    });

    this.eventSource.onopen = () => {
      this.reconnectTimeout = 1000;

      if (this.onopen) {
        this.onopen();
      }
    };

    this.eventSource.onerror = (err) => {
      if (this.onerror) {
        this.onerror(err);
      }

      this.eventSource?.close();
      this.scheduleReconnect();
    };

    for (const [type, callbacks] of Object.entries(this.listeners)) {
      for (const cb of callbacks) {
        this.eventSource.addEventListener(type, cb as EventListener);
      }
    }
  }

  private scheduleReconnect() {
    if (this.closed || this.reconnectTimerId) return;

    this.reconnectTimerId = setTimeout(() => {
      this.reconnectTimerId = null;
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
      this.connect();
    }, this.reconnectTimeout);
  }

  public addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(listener);

    if (this.eventSource) {
      this.eventSource.addEventListener(type, listener as EventListener);
    }
  }

  public removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) return;

    this.listeners[type] = this.listeners[type].filter((cb) => cb !== listener);

    if (this.eventSource) {
      this.eventSource.removeEventListener(type, listener as EventListener);
    }
  }

  public close() {
    this.closed = true;

    if (this.reconnectTimerId) {
      clearTimeout(this.reconnectTimerId);
      this.reconnectTimerId = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// get event source for PDF render status
export function getPDFRenderedEventSource(docId: string): ResilientEventSource {
  return new ResilientEventSource(`${documentUrl}${docId}/stream-updates`);
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
  return apiFetch(`${documentUrl}${docId}/history`).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch render history');
    }

    return res.json() as Promise<RenderHistoryDto[]>;
  });
}
