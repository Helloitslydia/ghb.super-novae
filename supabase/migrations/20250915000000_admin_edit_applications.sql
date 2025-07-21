/*
  # Allow admin to edit project applications via anon role

  1. Policy
    - project_applications: UPDATE for role anon
*/

DROP POLICY IF EXISTS "Anon can update application status" ON project_applications;

CREATE POLICY "Anon can edit project applications"
  ON project_applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
