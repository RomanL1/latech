CREATE TABLE files (
   id SERIAL PRIMARY KEY,
   filename TEXT,
   bucket TEXT,
   object_key TEXT,
   mime_type TEXT,
   size_bytes BIGINT,
   created_at TIMESTAMP DEFAULT NOW()
);