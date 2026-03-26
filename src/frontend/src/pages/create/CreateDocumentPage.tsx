import { CreateDocumentActions } from './actions/CreateDocumentActions';
import styles from './CreateDocumentPage.module.css';
import { CreateDocumentForm } from './form/CreateDocumentForm';
import { TemplateSelection } from './templates/TemplateSelection';

export function CreateDocumentPage() {
  return (
    <div className={styles.container}>
      <h2>Create new document</h2>
      <form className={styles.form}>
        <div>
          <CreateDocumentForm />
        </div>

        <div>
          <h3>Choose a template</h3>
          <TemplateSelection />
        </div>

        <div>
          <CreateDocumentActions />
        </div>
      </form>
    </div>
  );
}
