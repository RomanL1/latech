import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './ImageDropzone.module.css';
import { LucideFile } from 'lucide-react';
import { Text } from '@radix-ui/themes';

interface ImageDropzoneProps {
  onDrop: (files: File[]) => void;
}

const ImageDropzone = ({ onDrop }: ImageDropzoneProps) => {
  const handleOnDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
      console.log(acceptedFiles);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleOnDrop,
    accept: {
      'image/*': [],
    },
  });

  const dropZoneText = isDragActive ? 'Release to upload your images' : 'Drag & drop images here';

  return (
    <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
      <input {...getInputProps()} />
      <div className={styles.content}>
        <LucideFile size={35} />
          <div className={styles.textContent}>
            <Text>{dropZoneText}</Text>
            <Text color="gray" size="1" style={isDragActive ? { visibility: 'hidden' } : {}}>
              or click to browse
            </Text>
          </div>
      </div>
    </div>
  );
};

export default ImageDropzone;
