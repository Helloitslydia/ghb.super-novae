/*
  # Allow anyone to update project applications

  1. Policy
    - project_applications: UPDATE for role anon
*/

CREATE POLICY "Anon can update project applications" ON project_applications
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
