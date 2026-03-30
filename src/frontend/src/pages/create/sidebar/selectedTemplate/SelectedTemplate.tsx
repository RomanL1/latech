import { Card, Skeleton } from '@radix-ui/themes';
import type { DocumentTemplate } from '../../../../features/templates/template';
import styles from './SelectedTemplate.module.css';
import { FileTextIcon } from 'lucide-react';

interface SelectedTemplateProps {
  template: DocumentTemplate | null;
}

export function SelectedTemplate({ template }: SelectedTemplateProps) {
  return (
    <div className={styles.container}>
      <label>Selected Template</label>
      <Skeleton loading={!template} data-testid="selectedTemplateSkeleton">
        <Card className={styles.card}>
          <div className={styles.icon}>
            <FileTextIcon />
          </div>
          <div className={styles.info}>
            <span className={styles.name} data-testid="selectedTemplateName">
              {template?.name}
            </span>
            <span className={styles.description} data-testid="selectedTemplateDescription">
              {template?.description}
            </span>
          </div>
        </Card>
      </Skeleton>
    </div>
  );
}
