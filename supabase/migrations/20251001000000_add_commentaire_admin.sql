/*
  # Add commentaire column for admin notes to project_applications

  1. New Column
    - project_applications.commentaire text
*/

ALTER TABLE project_applications
  ADD COLUMN commentaire text;
