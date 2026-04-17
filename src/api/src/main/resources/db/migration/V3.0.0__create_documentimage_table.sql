CREATE TABLE documentimage (
                       image_id UUID PRIMARY KEY,
                       document_id UUID NOT NULL,
                       user_supplied_name TEXT NOT NULL,
                       mime_type TEXT NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT now(),
                       UNIQUE (document_id, user_supplied_name)
);