import { useQuery } from '@tanstack/react-query';
import type { DocumentTemplate } from './template';

const apiHost = window.ENV.VITE_API_HOST;
const templateUrl = `${apiHost}/template`;

export function getTemplates(): Promise<DocumentTemplate[]> {
  return fetch(templateUrl)
    .then((response) => response.json() as Promise<DocumentTemplate[]>)
    .catch(() => Promise.resolve<DocumentTemplate[]>([]));
}

export function useTemplatesQuery() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
}
