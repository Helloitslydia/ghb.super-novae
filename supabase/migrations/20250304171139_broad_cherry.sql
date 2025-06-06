/*
  # Add status field to auth.users table

  1. Changes
    - Add `status` column to `auth.users` table with default value 'active'
    - Add comment to explain the purpose of the status field
*/

ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

COMMENT ON COLUMN auth.users.status IS 'User account status (e.g., active, suspended, deleted)';