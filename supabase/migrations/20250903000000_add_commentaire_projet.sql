/*
  # Add commentaire_projet column to project_applications

  1. New Column
    - project_applications.commentaire_projet text
*/

ALTER TABLE project_applications
  ADD COLUMN commentaire_projet text;
