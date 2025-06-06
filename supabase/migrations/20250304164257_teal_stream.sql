/*
  # Add delete policy for recordings

  1. Changes
    - Add policy allowing users to delete their own recordings
  
  2. Security
    - Users can only delete recordings they own
*/

-- Add delete policy for recordings
CREATE POLICY "Users can delete their own recordings"
  ON recordings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);