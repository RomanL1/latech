import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { saveTemplate } from '../../features/documents/api';
import type { DocumentTemplate } from '../../features/templates/template';
import styles from './CreateDocumentPage.module.css';
import { useDocumentCreationForm } from './form';
import { CreateDocumentSidebar } from './sidebar/CreateDocumentSidebar';
import { TemplateSelection } from './templates/TemplateSelection';

export function CreateDocumentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const form = useDocumentCreationForm();

  const navigate = useNavigate();

  function handleSubmit() {
    const request = saveTemplate({
      name: form.getValues('documentName'),
      password: form.getValues('password'),
      templateId: form.getValues('templateId')!,
    });

    request.then(({ documentId }) => navigate(`/document/${documentId}`)).catch();
  }

  function handleTemplateSelect(template: DocumentTemplate) {
    setSelectedTemplate(template);
  }

  return (
    <FormProvider {...form}>
      <form className={styles.form}>
        <div className={styles.sidebar}>
          <CreateDocumentSidebar selectedTemplate={selectedTemplate} onSubmit={() => handleSubmit()} />
        </div>
        <div className={styles.templates}>
          <TemplateSelection onTemplateSelected={(template) => handleTemplateSelect(template)} />
        </div>
      </form>
    </FormProvider>
  );
}
