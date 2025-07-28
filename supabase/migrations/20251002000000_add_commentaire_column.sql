/*
  # Ensure commentaire column exists in project_applications

  1. New Column
    - project_applications.commentaire text
*/

ALTER TABLE project_applications
  ADD COLUMN IF NOT EXISTS commentaire text;
