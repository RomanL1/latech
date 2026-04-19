import { Button, Card, Dialog, IconButton, Inset, Spinner, Text } from '@radix-ui/themes';
import { LucideTrash, Upload } from 'lucide-react';
import ImageDropzone from '../../../../shared/components/ImageDropzone/ImageDropzone';
import styles from './UploadImageDialog.module.css';
import { useState } from 'react';
import { useParams } from 'react-router';
import { usePostImages } from '../../../../features/documents/api';

interface UploadImageDialogProps {
  className?: string;
}

const UploadImageDialog = ({ className }: UploadImageDialogProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const documentId = useParams().documentId;
  const mutation = usePostImages(documentId!);
  const [open, setOpen] = useState(false);

  const handleOnFileDrop = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleOnDeleteFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOnClose = () => {
    setUploadedFiles([]);
    setOpen(false);
    mutation.reset();
  };

  const handleOnUpload = async () => {
    await mutation.mutateAsync(uploadedFiles).then(() => {
      handleOnClose();
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button className={className}>
          <Upload size={20} />
          Upload Image
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className={styles.dialogContent} onInteractOutside={(event) => event.preventDefault()}>
        <Dialog.Title>Upload Image</Dialog.Title>
        <ImageDropzone onDrop={handleOnFileDrop} />

        {uploadedFiles.length > 0 && (
          <div className={styles.uploadedFiles}>
            {uploadedFiles.map((file, index) => (
              <Card key={index} className={styles.fileCard} size="1">
                <IconButton className={styles.deleteButton} onClick={() => handleOnDeleteFile(index)}>
                  <LucideTrash />
                </IconButton>
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
                <Text size="1">{file.name}</Text>
              </Card>
            ))}
          </div>
        )}

        {mutation.isError && (
          <Text color="red" size="2">
            {mutation.error.message}
          </Text>
        )}

        <div className={styles.actionButtons}>
          <Button variant="soft" color="gray" onClick={handleOnClose}>
            Close
          </Button>
          <Button onClick={handleOnUpload} disabled={uploadedFiles.length === 0 || mutation.isPending}>
            <Spinner loading={mutation.isPending} />
            {mutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default UploadImageDialog;
