import { Separator } from 'react-resizable-panels';
import styles from './ResizeSeparator.module.css';

interface ResizeSeparatorProps {
  onClick?: () => void;
}

const ResizeSeparator = ({ onClick }: ResizeSeparatorProps) => {
  const handleClick = () => {
    console.log('CLICK');
    console.log(onClick);
    onClick?.();
  };

  return (
    <Separator className={styles.separator} onDoubleClick={handleClick}>
      <span className={styles.centerGrip} onClick={handleClick} />
    </Separator>
  );
};

export default ResizeSeparator;
