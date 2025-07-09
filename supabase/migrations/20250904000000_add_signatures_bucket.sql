/*
  # Create signatures storage bucket

  1. Storage Setup
    - Create 'signatures' bucket for user signatures
    - Configure bucket to be private

  2. Security Policies
    - Allow authenticated users to upload/view/delete files within their own folder
*/

-- Create the signatures bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false);

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their signatures" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to view their own signatures
CREATE POLICY "Users can view their signatures" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to delete their own signatures
CREATE POLICY "Users can delete their signatures" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
