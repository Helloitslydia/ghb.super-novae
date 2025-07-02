/*
  # Create user_documents table to track uploaded documents

  1. New Tables
    - `user_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `doc_key` (text)
      - `file_path` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_documents`
    - Policies for users to manage their own documents
*/

-- Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  doc_key text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Policy: users can view their documents
CREATE POLICY "Users can view their documents"
  ON user_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: users can insert documents
CREATE POLICY "Users can add their documents"
  ON user_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
