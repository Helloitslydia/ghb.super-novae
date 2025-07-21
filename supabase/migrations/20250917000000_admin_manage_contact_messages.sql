/*
  # Allow admin to view and delete contact messages via anon role

  1. Policies
    - contact_messages: SELECT for role anon
    - contact_messages: DELETE for role anon
*/

CREATE POLICY "Anon can read contact messages" ON contact_messages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can delete contact messages" ON contact_messages
  FOR DELETE TO anon
  USING (true);
