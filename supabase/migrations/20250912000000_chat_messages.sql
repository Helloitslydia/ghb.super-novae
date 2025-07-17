/*
  # Create chat_messages table for contact widget conversations

  1. New Table
    - chat_messages
      - id uuid primary key
      - email text
      - message text
      - from_admin boolean
      - created_at timestamp

  2. Security
    - Enable RLS
    - Allow anonymous users to insert messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  message text NOT NULL,
  from_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat messages" ON chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
