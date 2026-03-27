import { Card } from '@radix-ui/themes';
import type { DocumentTemplate } from '../../../../features/templates/template';
import styles from './SelectedTemplate.module.css';
import { FileTextIcon } from 'lucide-react';

interface SelectedTemplateProps {
  template?: DocumentTemplate;
}

export function SelectedTemplate({
  template = { templateId: '123', name: 'Test', description: 'Entscheidender Test' },
}: SelectedTemplateProps) {
  return (
    <div>
      <label className={styles.label}>Selected Template</label>
      <Card className={styles.card}>
        <div className={styles.icon}>
          <FileTextIcon />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{template.name}</span>
          <span className={styles.description}>{template.description}</span>
        </div>
      </Card>
    </div>
  );
}
