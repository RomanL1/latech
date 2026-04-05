import { Inset, RadioCards, Skeleton } from '@radix-ui/themes';
import styles from './TemplateSelection.module.css';

export function TemplateCardSkeleton() {
  const numberOfSkeletons = 9;
  const skeletons = Array.from(Array(numberOfSkeletons).keys()).map(String);

  return skeletons.map((index) => (
    <Skeleton loading key={index} data-testid="templateCardSkeleton">
      <RadioCards.Item value={index} className={styles.card}>
        <Inset className={styles.template}>
          <div className={styles.previewImage}></div>
          <div className={styles.templateInfo}>
            <span className={styles.name}></span>
            <span className={styles.description}></span>
          </div>
        </Inset>
      </RadioCards.Item>
    </Skeleton>
  ));
}
