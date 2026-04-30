CREATE TABLE render_history (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    render_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    log_message TEXT,
    rendered_at TIMESTAMP NOT NULL
);
