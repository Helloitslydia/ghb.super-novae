/*
  # Add fields for refusal reasons on project_applications

  1. New Columns
    - project_applications.refusal_reason text
    - project_applications.missing_elements_reason text
*/

ALTER TABLE project_applications
  ADD COLUMN refusal_reason text,
  ADD COLUMN missing_elements_reason text;
