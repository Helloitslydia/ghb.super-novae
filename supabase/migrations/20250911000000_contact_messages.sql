/*
  # Create contact_messages table for contact form submissions

  1. New Table
    - contact_messages
      - id uuid primary key
      - email text
      - message text
      - created_at timestamp

  2. Security
    - Enable RLS
    - Allow anonymous users to insert messages
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
