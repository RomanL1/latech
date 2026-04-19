import type { DocumentImage } from '../../../features/documents/document';
import styles from './ImagePreview.module.css';

interface ImagePreviewProps {
  selectedFile?: DocumentImage;
}

const apiHost = window.ENV.VITE_API_HOST;

const ImagePreview = ({ selectedFile }: ImagePreviewProps) => {
  return (
    <div className={styles.container}>
      <img src={apiHost + selectedFile?.url} alt="Preview" />
    </div>
  );
};

export default ImagePreview;
