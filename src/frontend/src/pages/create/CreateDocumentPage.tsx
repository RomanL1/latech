import { useState } from 'react';
import type { DocumentCreation } from '../../features/documents/document';
import type { DocumentTemplate } from '../../features/templates/template';
import styles from './CreateDocumentPage.module.css';
import { CreateDocumentSidebar } from './sidebar/CreateDocumentSidebar';
import type { DocumentCredentials } from './sidebar/credentials';
import { TemplateSelection } from './templates/TemplateSelection';

export function CreateDocumentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  function handleSubmit({ name, password }: DocumentCredentials) {
    const document: DocumentCreation = {
      name,
      password,
      templateId: selectedTemplate!.templateId,
    };

    console.log(document);
  }

  function handleTemplateSelect(template: DocumentTemplate) {
    setSelectedTemplate(template);
  }

  return (
    <form className={styles.form}>
      <div className={styles.sidebar}>
        <CreateDocumentSidebar
          selectedTemplate={selectedTemplate}
          onSubmit={(credentials) => handleSubmit(credentials)}
        />
      </div>
      <div className={styles.templates}>
        <TemplateSelection onTemplateSelected={(template) => handleTemplateSelect(template)} />
      </div>
    </form>
  );
}
