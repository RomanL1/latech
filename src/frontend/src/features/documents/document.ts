export interface DocumentMetadata {
  documentId: string;
  lastEdited: Date;
  name: string;
}

export interface DocumentCreation {
  name: string;
  password: string | null;
  templateId: string;
}
