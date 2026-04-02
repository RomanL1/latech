import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import type { DocumentCreation } from '../../features/documents/document';
import type { DocumentTemplate } from '../../features/templates/template';
import styles from './CreateDocumentPage.module.css';
import { useDocumentCreationForm } from './form';
import { CreateDocumentSidebar } from './sidebar/CreateDocumentSidebar';
import { TemplateSelection } from './templates/TemplateSelection';

export function CreateDocumentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const form = useDocumentCreationForm();

  function handleSubmit() {
    const document: DocumentCreation = {
      name: form.getValues('documentName'),
      password: form.getValues('password'),
      templateId: form.getValues('templateId')!,
    };

    console.log(document);
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
