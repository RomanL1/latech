ALTER TABLE document
    ADD COLUMN last_change  TIMESTAMPTZ,
    ADD COLUMN last_compile TIMESTAMPTZ,
    ADD COLUMN pdf_path TEXT,
    ADD COLUMN compile_abandoned_at TIMESTAMPTZ;