import { useQuery } from '@tanstack/react-query';
import type { DocumentTemplate } from './template';

const fakeTemplates: DocumentTemplate[] = [
  { templateId: '1', name: 'Blank document', description: 'Start with a clean slate.' },
  { templateId: '2', name: 'Essay', description: 'Academic essay format' },
  { templateId: '3', name: 'Formal Letter', description: 'Traditional letter format' },
  { templateId: '4', name: 'Meeting Notes', description: 'Organized template for catching meetin notes' },
  { templateId: '5', name: 'Resume/CV', description: 'Clean, professional layout to showcase your skills' },
  { templateId: '6', name: 'Blank document', description: 'Start with a clean slate.' },
  { templateId: '7', name: 'Essay', description: 'Academic essay format' },
  { templateId: '8', name: 'Formal Letter', description: 'Traditional letter format' },
  { templateId: '9', name: 'Meeting Notes', description: 'Organized template for catching meetin notes' },
  { templateId: '10', name: 'Resume/CV', description: 'Clean, professional layout to showcase your skills' },
];

export function getTemplates(): Promise<DocumentTemplate[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fakeTemplates);
    }, 2000);
  });
}

export function useTemplatesQuery() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
}
