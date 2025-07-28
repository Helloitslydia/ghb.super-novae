/*
  # Add anon read policy for user documents

  1. Security
    - Add policy for anonymous users to read user documents if it doesn't already exist
    - Uses DROP IF EXISTS and CREATE to handle existing policy gracefully
*/

-- Drop the policy if it already exists to avoid conflicts
DROP POLICY IF EXISTS "Anon can read user documents" ON user_documents;

-- Create the policy to allow anonymous users to read user documents
CREATE POLICY "Anon can read user documents" ON user_documents
  FOR SELECT TO anon
  USING (true);