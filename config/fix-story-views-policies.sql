-- Fix for story_views RLS policies
-- This adds the missing UPDATE policy and improves the INSERT policy
-- to properly handle upsert operations for story viewing

-- Drop the existing simple INSERT policy and replace with a better one
DROP POLICY IF EXISTS "Users can insert story views" ON public.story_views;

-- Create comprehensive INSERT policy that checks story accessibility
CREATE POLICY "Users can insert story views" ON public.story_views
  FOR INSERT WITH CHECK (
    auth.uid() = viewer_id AND
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_views.story_id 
      AND (
        -- Can view own stories
        stories.user_id = auth.uid() OR
        -- Can view stories from users they follow
        EXISTS (
          SELECT 1 FROM public.follows 
          WHERE follows.follower_id = auth.uid() 
          AND follows.following_id = stories.user_id
          AND follows.status = 'approved'
        ) OR
        -- Can view public stories
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = stories.user_id 
          AND users.is_private = false
        )
      )
    )
  );

-- Add missing UPDATE policy for upsert operations
CREATE POLICY "Users can update own story views" ON public.story_views
  FOR UPDATE USING (
    auth.uid() = viewer_id AND
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_views.story_id 
      AND (
        -- Can view own stories
        stories.user_id = auth.uid() OR
        -- Can view stories from users they follow
        EXISTS (
          SELECT 1 FROM public.follows 
          WHERE follows.follower_id = auth.uid() 
          AND follows.following_id = stories.user_id
          AND follows.status = 'approved'
        ) OR
        -- Can view public stories
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = stories.user_id 
          AND users.is_private = false
        )
      )
    )
  ); 