CREATE TABLE document (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    password VARCHAR(255)
);

CREATE TABLE template (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    content TEXT
);
