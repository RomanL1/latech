import { Card, Inset } from '@radix-ui/themes';
import { FileTextIcon } from 'lucide-react';
import type { DocumentMetadata } from '../../../../features/documents/document';
import styles from './DocumentCard.module.css';

export interface DocumentCardProps {
  document: DocumentMetadata;
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card className={styles.card}>
      <Inset className={styles.image} clip="padding-box" side="top"></Inset>
      <Inset className={styles.infoRow} clip="padding-box" side="bottom">
        <FileTextIcon className={styles.icon} />
        <div className={styles.info}>
          <span className={styles.title} data-testid="documentTitle">
            {document.name}
          </span>
          <span className={styles.lastEdited} data-testid="lastEdited">
            Edited {getLastEditedText(document.lastEdited)}
          </span>
        </div>
      </Inset>
    </Card>
  );
}

function getLastEditedText(date: Date): string {
  const now = Date.now();
  const past = new Date(date).getTime();
  const differenceInSeconds = Math.floor((now - past) / 1000);

  const units = [
    { name: 'year', seconds: 60 * 60 * 24 * 365 },
    { name: 'month', seconds: 60 * 60 * 24 * 30 },
    { name: 'week', seconds: 60 * 60 * 24 * 7 },
    { name: 'day', seconds: 60 * 60 * 24 },
    { name: 'hour', seconds: 60 * 60 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ];

  for (const unit of units) {
    const value = Math.floor(differenceInSeconds / unit.seconds);
    if (value >= 1) {
      const pluralSuffix = value > 1 ? 's' : '';
      return `${value} ${unit.name}${pluralSuffix} ago`;
    }
  }

  return 'just now';
}
