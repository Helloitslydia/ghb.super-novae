/*
  # Add surface_plantes_parfum_medicinales column to project_applications

  1. New Column
    - project_applications.surface_plantes_parfum_medicinales text
*/

ALTER TABLE project_applications
  ADD COLUMN surface_plantes_parfum_medicinales text;
