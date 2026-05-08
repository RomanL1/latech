import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { Document, DocumentCreation, DocumentImage } from './document';
import { storeDocument } from './store';

const apiHost = window.ENV.VITE_API_HOST;
const documentUrl = `${apiHost}/document`;

interface CreateDocumentResponse {
  documentId: string;
  name: string;
}

async function readError(response: Response, fallback: string): Promise<Error> {
  try {
    const errorData = await response.json();
    return new Error(errorData.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
    },
  });
}

export function saveTemplate(document: DocumentCreation): Promise<CreateDocumentResponse> {
  const request = apiFetch(documentUrl, {
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

async function getDocument(documentId: string): Promise<Document> {
  return apiFetch(`${documentUrl}/${documentId}`).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to fetch document');
    }

    return response.json() as Promise<Document>;
  });
}

export function useGetDocument(documentId: string): UseQueryResult<Document> {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
  });
}

async function unlockDocument(documentId: string, password: string): Promise<void> {
  return apiFetch(`${documentUrl}/${documentId}/unlock`, {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to unlock document');
    }
  });
}

export function useUnlockDocument(documentId: string): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (password) => unlockDocument(documentId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

async function postImages(documentId: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiFetch(`${documentUrl}/${documentId}/images/upload`, {
    method: 'POST',
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to upload images');
    }
  });
}

async function getImages(documentId: string): Promise<DocumentImage[]> {
  return apiFetch(`${documentUrl}/${documentId}/images`).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to fetch images');
    }

    return response.json() as Promise<DocumentImage[]>;
  });
}

export function usePostImages(documentId: string): UseMutationResult<void, Error, File[]> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, File[]>({
    mutationFn: (files) => postImages(documentId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

export function useDeleteImage(documentId: string): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (imageId) =>
      apiFetch(`${documentUrl}/${documentId}/images/${imageId}`, { method: 'DELETE' }).then(async (response) => {
        if (!response.ok) {
          throw await readError(response, 'Failed to delete image');
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

export function useGetImages(documentId: string, enabled = true): UseQueryResult<DocumentImage[]> {
  return useQuery({
    queryKey: ['images', documentId],
    queryFn: () => getImages(documentId),
    enabled,
  });
}

async function getImageBlob(documentId: string, imageId: string): Promise<Blob> {
  return apiFetch(`${documentUrl}/${documentId}/images/${imageId}`).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to download image');
    }

    return response.blob();
  });
}

async function renameImage(documentId: string, imageId: string, newName: string): Promise<void> {
  return apiFetch(`${documentUrl}/${documentId}/images/${imageId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: newName }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw await readError(response, 'Failed to rename image');
    }
  });
}

interface RenameImageDto {
  imageId: string;
  newName: string;
}

export function useRenameImage(documentId: string): UseMutationResult<void, Error, RenameImageDto> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RenameImageDto>({
    mutationFn: ({ newName, imageId }) => renameImage(documentId, imageId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

interface DownloadImageDto {
  imageId: string;
  imageName: string;
}

export function useDownloadImage(documentId: string): UseMutationResult<void, Error, DownloadImageDto> {
  return useMutation<void, Error, DownloadImageDto>({
    mutationFn: ({ imageId, imageName }) =>
      getImageBlob(documentId, imageId).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }),
  });
}

export interface DocumentTimestampsDto {
  lastChange: string | null;
  lastCompile: string | null;
}

export function getDocumentTimestamps(docId: string): Promise<DocumentTimestampsDto> {
  return apiFetch(`${documentUrl}/${docId}/timestamps`).then(async (res) => {
    if (!res.ok) {
      throw await readError(res, 'Failed to fetch document timestamps');
    }

    return res.json() as Promise<DocumentTimestampsDto>;
  });
}
