/*
  # Make documents and signatures buckets public
  1. Update bucket settings
    - Set 'public' column to true for both buckets
  2. Security Policies
    - Allow anonymous and authenticated users to read files in these buckets
*/

-- Update buckets to be publicly accessible
UPDATE storage.buckets
SET public = true
WHERE id IN ('documents', 'signatures');

-- Policy to allow anyone to read documents
CREATE POLICY "Public read documents" ON storage.objects
FOR SELECT TO authenticated, anon
USING (
  bucket_id = 'documents'
);

-- Policy to allow anyone to read signatures
CREATE POLICY "Public read signatures" ON storage.objects
FOR SELECT TO authenticated, anon
USING (
  bucket_id = 'signatures'
);
