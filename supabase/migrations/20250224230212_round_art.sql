/*
  # Final cleanup of profiles table and related objects

  1. Changes
    - Drop the profiles table and its associated policies
    - Remove the trigger and function for profile creation
    - Ensure idempotent operations with IF EXISTS clauses

  2. Safety
    - All operations use IF EXISTS to prevent errors
    - CASCADE ensures all dependent objects are removed
*/

-- First check if the trigger exists before dropping
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles table and its policies if it exists
DROP TABLE IF EXISTS profiles CASCADE;