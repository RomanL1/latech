CREATE TABLE document_session (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT fk_document_session_document
      FOREIGN KEY (document_id)
          REFERENCES document(id)
          ON DELETE CASCADE
);