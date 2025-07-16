/*
  # Allow anonymous users to read only applications currently under review
  1. Policy
    - project_applications: SELECT for role anon
      where status = 'Etude du dossier en cours'
*/

CREATE POLICY "Anon can read in-progress applications"
  ON project_applications
  FOR SELECT
  TO anon
  USING (status = 'Etude du dossier en cours');
