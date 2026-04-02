import { RadioCards } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useTemplatesQuery } from '../../../features/templates/api';
import type { DocumentTemplate } from '../../../features/templates/template';
import { useDocumentCreationFormContext } from '../form';
import { TemplateCards } from './TemplateCards';
import { TemplateCardSkeleton } from './TemplateCardsSkeleton';
import styles from './TemplateSelection.module.css';

export interface TemplateSelectionProps {
  onTemplateSelected: (template: DocumentTemplate) => unknown;
}

export function TemplateSelection({ onTemplateSelected }: TemplateSelectionProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { data: templates = [], isLoading } = useTemplatesQuery();
  const form = useDocumentCreationFormContext();

  const effectiveSelectedTemplateId = selectedTemplateId || templates[0]?.templateId || null;
  const selectedTemplate = templates.find((template) => template.templateId === effectiveSelectedTemplateId) ?? null;

  useEffect(() => {
    if (selectedTemplate) {
      onTemplateSelected(selectedTemplate);
      form.setValue('templateId', selectedTemplate.templateId);
    }
  }, [selectedTemplate, onTemplateSelected, form]);

  return (
    <RadioCards.Root asChild value={effectiveSelectedTemplateId} onValueChange={setSelectedTemplateId}>
      <div className={styles.grid}>
        {isLoading ? <TemplateCardSkeleton /> : <TemplateCards templates={templates} />}
      </div>
    </RadioCards.Root>
  );
}
