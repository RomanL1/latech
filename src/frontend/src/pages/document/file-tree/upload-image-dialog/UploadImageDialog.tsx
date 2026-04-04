import { Button, Card, Dialog, Inset, Text } from '@radix-ui/themes';
import { Upload } from 'lucide-react';
import ImageDropzone from '../../../../shared/components/ImageDropzone/ImageDropzone';
import styles from './UploadImageDialog.module.css';
import { useState } from 'react';

interface UploadImageDialogProps {
  className?: string;
  onUpload?: (files: File[]) => void;
}

const UploadImageDialog = ({ className, onUpload }: UploadImageDialogProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleOnFileDrop = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button className={className}>
          <Upload size={20} />
          Upload Image
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className={styles.dialogContent}>
        <Dialog.Title>Upload Image</Dialog.Title>
        <ImageDropzone onDrop={handleOnFileDrop} />

        {uploadedFiles.length > 0 && (
          <div className={styles.uploadedFiles}>
            {uploadedFiles.map((file, index) => (
              <Card key={index} className={styles.fileCard} size="1">
                <Inset clip="padding-box" side="top" pb="current">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{
                      display: 'block',
                      objectFit: 'cover',
                      width: '100%',
                      height: 140,
                    }}
                  />
                </Inset>
                <Text size="1">
                  {file.name}
                </Text>
              </Card>
            ))}
          </div>
        )}

        <div className={styles.actionButtons}>
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={() => onUpload?.(uploadedFiles)}>Upload</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default UploadImageDialog;
