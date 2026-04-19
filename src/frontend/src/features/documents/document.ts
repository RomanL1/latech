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

export interface DocumentImage {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  secured: boolean;
}
