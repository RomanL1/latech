import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { DocumentCreation, DocumentImage } from './document';
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

async function postImages(documentId: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return fetch(`${documentUrl}/${documentId}/images/upload`, {
    method: 'POST',
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.message || 'Failed to upload images');
      });
    }
  });
}

async function getImages(documentId: string): Promise<DocumentImage[]> {
  return (await fetch(`${documentUrl}/${documentId}/images`)).json();
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
      fetch(`${documentUrl}/${documentId}/images/${imageId}`, { method: 'DELETE' }).then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to delete image');
          });
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

export function useGetImages(documentId: string): UseQueryResult<DocumentImage[]> {
  return useQuery({
    queryKey: ['images', documentId],
    queryFn: () => getImages(documentId),
  });
}

async function getImageBlob(documentId: string, imageId: string): Promise<Blob> {
  return fetch(`${documentUrl}/${documentId}/images/${imageId}`).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.message || 'Failed to download image');
      });
    }

    return response.blob();
  });
}

async function renameImage(documentId: string, imageId: string, newName: string): Promise<void> {
  return fetch(`${documentUrl}/${documentId}/images/${imageId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: newName }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.message || 'Failed to rename image');
      });
    }
  });
}

export function useRenameImage(documentId: string, imageId: string): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (newName: string) => renameImage(documentId, imageId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', documentId] });
    },
  });
}

export function useDownloadImage(documentId: string, imageName: string): UseMutationResult<Blob, Error, string> {
  return useMutation<Blob, Error, string>({
    mutationFn: (imageId: string) => getImageBlob(documentId, imageId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}
