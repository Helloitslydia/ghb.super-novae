/*
  # Clean up profiles table and related objects

  1. Changes
    - Drop the profiles table and its associated policies
    - Remove the trigger and function for profile creation
    - Keep auth.users in realtime publication for future use

  2. Rationale
    - User data is already stored in auth.users table
    - No need for duplicate storage in a separate profiles table
    - Full name is stored in auth.users.raw_user_meta_data
*/

-- Drop the trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that was used by the trigger
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles table and its policies (CASCADE will remove dependent objects like policies)
DROP TABLE IF EXISTS profiles CASCADE;