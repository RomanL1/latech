import { Inset, RadioCards } from '@radix-ui/themes';
import { useState } from 'react';
import type { DocumentTemplate } from '../../../features/templates/template';
import styles from './TemplateSelection.module.css';

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

export interface TemplateSelectionProps {
  templates?: DocumentTemplate[];
}

export function TemplateSelection({ templates = fakeTemplates }: TemplateSelectionProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].templateId);

  return (
    <RadioCards.Root
      value={selectedTemplateId}
      onValueChange={(id) => setSelectedTemplateId(id)}
      columns={{ sm: '2', md: '3', lg: '4' }}
    >
      {templates.map((template) => (
        <RadioCards.Item value={template.templateId} className={styles.card} key={template.templateId}>
          <Inset className={styles.template} clip="padding-box">
            <div className={styles.previewImage}></div>
            <div className={styles.templateInfo}>
              <span className={styles.name}>{template.name}</span>
              <span className={styles.description}>{template.description}</span>
            </div>
          </Inset>
        </RadioCards.Item>
      ))}
    </RadioCards.Root>
  );
}
