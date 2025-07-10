/*
  # Add besoin_equipement column to project_applications

  1. New Column
    - project_applications.besoin_equipement text
*/

ALTER TABLE project_applications
  ADD COLUMN besoin_equipement text;
