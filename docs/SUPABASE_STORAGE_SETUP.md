# Supabase Storage Setup for Media Upload

## Required Storage Bucket Setup

To make story and post media uploads work, you need to create and configure a storage bucket in Supabase.

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create bucket**
4. Name the bucket: `media`
5. Make sure **Public bucket** is **ENABLED** (this allows public access to uploaded media)
6. Click **Create bucket**

### 2. Set Up Storage Policies

**IMPORTANT**: Delete any existing storage policies for the `media` bucket first, then run this SQL in your Supabase SQL Editor:

```sql
-- First, drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- Allow authenticated users to upload their own media
-- File structure: posts/{user_id}/filename or stories/{user_id}/filename
CREATE POLICY "Users can upload their own media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow public access to view media
CREATE POLICY "Media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

### 3. Verify Setup

After setup, your storage bucket should:
- Be named `media`
- Be publicly accessible (for viewing uploaded images/videos)
- Have proper RLS policies for user uploads
- Organize files by user ID in folders like: `posts/{user_id}/` and `stories/{user_id}/`

### 4. File Organization

The app will automatically organize uploaded files like this:
```
media/
├── posts/
│   └── {user_id}/
│       ├── {timestamp}_{random}.jpg
│       └── {timestamp}_{random}.mp4
└── stories/
    └── {user_id}/
        ├── {timestamp}_{random}.jpg
        └── {timestamp}_{random}.mp4
```

## Testing

After setup, test the media upload by:
1. Creating a new story in the app
2. Check that the story appears in the stories bar
3. Verify the media file appears in your Supabase Storage bucket

## Troubleshooting

**Story doesn't appear after creation:**
- Check if the `media` bucket exists and is public
- Verify the storage policies are applied correctly
- Check browser/app console for error messages

**Upload fails with "row-level security policy" error:**
- Make sure you dropped the old policies first
- Verify the new policies are applied correctly  
- Check that the user is authenticated

**Upload fails:**
- Ensure the user is authenticated
- Check that the storage policies allow uploads
- Verify network connectivity 