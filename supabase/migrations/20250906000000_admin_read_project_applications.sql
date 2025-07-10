/*
  # Allow anonymous users to read all project applications
  1. Policy
    - project_applications: SELECT for role anon
*/

CREATE POLICY "Anon can read all applications"
  ON project_applications
  FOR SELECT
  TO anon
  USING (true);
