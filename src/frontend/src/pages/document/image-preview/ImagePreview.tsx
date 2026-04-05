import type { ImageFile } from '../sampleData';
import styles from './ImagePreview.module.css';

interface ImagePreviewProps {
  selectedFile?: ImageFile;
}

const ImagePreview = ({ selectedFile }: ImagePreviewProps) => {
  return (
    <div className={styles.container}>
      <img src={selectedFile?.path} alt="Preview" />
    </div>
  );
};

export default ImagePreview;
