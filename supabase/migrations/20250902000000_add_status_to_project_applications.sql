/*
  # Add status column to track application process

  1. New Column
    - project_applications.status text
      - default 'Brouillon'
*/

ALTER TABLE project_applications
  ADD COLUMN status text DEFAULT 'Brouillon';
