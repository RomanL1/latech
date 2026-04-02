import { Inset, RadioCards } from '@radix-ui/themes';
import type { DocumentTemplate } from '../../../features/templates/template';
import styles from './TemplateSelection.module.css';

interface TemplateCardsProps {
  templates: DocumentTemplate[];
}

export function TemplateCards({ templates }: TemplateCardsProps) {
  return templates.map((template) => (
    <RadioCards.Item
      value={template.templateId}
      className={styles.card}
      key={template.templateId}
      data-testid="templateCard"
    >
      <Inset className={styles.template}>
        <div className={styles.previewImage}></div>
        <div className={styles.templateInfo}>
          <span className={styles.name} data-testid="templateName">
            {template.name}
          </span>
          <span className={styles.description} data-testid="templateDescription">
            {template.description}
          </span>
        </div>
      </Inset>
    </RadioCards.Item>
  ));
}
