CREATE TABLE documentimages (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       document_id UUID NOT NULL,
                       user_supplied_name TEXT NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT now(),
                       UNIQUE (document_id, user_supplied_name)
);