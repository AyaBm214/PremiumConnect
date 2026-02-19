-- Create the 'properties' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'user_docs' bucket for profile documents (identity, insurance, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_docs', 'user_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view photos (so they show in Admin Dashboard)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

-- Policy to allow authenticated users to upload photos
-- Only allows uploading to a folder matching their user ID to keep things organized
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'properties' AND (auth.uid() = owner) );
-- Note: The 'owner' column in storage.objects is automatically set to auth.uid() by Supabase on insert if not provided,
-- but sometimes we need to be looser if we just want "any authenticated user".
-- A simpler policy for now:
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK ( bucket_id = 'properties' );

-- Policy to allow users to update/delete their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'properties' AND owner = auth.uid() );

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'properties' AND owner = auth.uid() );

-- user_docs bucket policies (profile.identity, profile.insurance, etc.)
DROP POLICY IF EXISTS "Public read user_docs" ON storage.objects;
CREATE POLICY "Public read user_docs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user_docs' );

DROP POLICY IF EXISTS "Users can upload to own folder in user_docs" ON storage.objects;
CREATE POLICY "Users can upload to own folder in user_docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'user_docs' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "Users can update own user_docs" ON storage.objects;
CREATE POLICY "Users can update own user_docs"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'user_docs' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "Users can delete own user_docs" ON storage.objects;
CREATE POLICY "Users can delete own user_docs"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'user_docs' AND (storage.foldername(name))[1] = auth.uid()::text );
