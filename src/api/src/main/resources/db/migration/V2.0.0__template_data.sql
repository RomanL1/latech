ALTER TABLE template
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

INSERT INTO template (name, description, content)
VALUES ('Blank Document', 'Start with a clean slate', 'Blank Document'),
       ('Essay', 'Academic essay format', 'Essay'),
       ('Formal letter', 'Start with a clean slate', 'Formal letter'),
       ('Meeting notes', 'Organized template for catching meeting notes', 'Meeting notes'),
       ('Resume/CV', 'Clean, professional layout to showcase your skills', 'Resume/CV');
