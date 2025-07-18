/*
  # Allow anonymous users to update the status column on project applications

  1. Policy
    - project_applications: UPDATE (status) for role anon
*/

DROP POLICY IF EXISTS "Anon can update project applications" ON project_applications;

CREATE POLICY "Anon can update application status"
  ON project_applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
