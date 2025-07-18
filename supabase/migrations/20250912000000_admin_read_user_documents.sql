/*
  # Allow anonymous read access to user_documents for admin page

  1. Policy
    - user_documents: SELECT for role anon
*/

CREATE POLICY "Anon can read user documents" ON user_documents
  FOR SELECT TO anon
  USING (true);
