/*
  # Create recordings and transcriptions tables

  1. New Tables
    - `recordings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `created_at` (timestamp)
      - `status` (text)
    - `transcriptions`
      - `id` (uuid, primary key)
      - `recording_id` (uuid, foreign key to recordings)
      - `original_text` (text)
      - `translated_text` (text)
      - `created_at` (timestamp)
      - `language` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active'
);

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid REFERENCES recordings(id) ON DELETE CASCADE NOT NULL,
  original_text text NOT NULL,
  translated_text text,
  created_at timestamptz DEFAULT now(),
  language text DEFAULT 'fr'
);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Policies for recordings
CREATE POLICY "Users can view their own recordings"
  ON recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recordings"
  ON recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for transcriptions
CREATE POLICY "Users can view transcriptions of their recordings"
  ON transcriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recordings
      WHERE recordings.id = transcriptions.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transcriptions for their recordings"
  ON transcriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recordings
      WHERE recordings.id = transcriptions.recording_id
      AND recordings.user_id = auth.uid()
    )
  );