-- Fix missing RLS policies for post_media table
-- Run this in Supabase SQL Editor to fix the 403 error when creating posts

-- Add missing INSERT policy for post_media
CREATE POLICY "Users can insert media for own posts" ON public.post_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_media.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Add missing UPDATE policy for post_media  
CREATE POLICY "Users can update media for own posts" ON public.post_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_media.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Add missing DELETE policy for post_media
CREATE POLICY "Users can delete media for own posts" ON public.post_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_media.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Add missing policies for other tables that might cause issues

-- Comments policies
CREATE POLICY "Users can insert comments on visible posts" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = comments.post_id 
      AND (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = posts.user_id 
          AND (users.is_private = false OR users.id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Comments are visible on visible posts" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = comments.post_id 
      AND (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = posts.user_id 
          AND (users.is_private = false OR users.id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Users can view stories from followed users" ON public.stories
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follows.follower_id = auth.uid() 
      AND follows.following_id = stories.user_id
      AND follows.status = 'approved'
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = stories.user_id 
      AND users.is_private = false
    )
  );

CREATE POLICY "Users can insert own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Users can view story views for own stories" ON public.story_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_views.story_id 
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert story views" ON public.story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Follow policies
CREATE POLICY "Users can view follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own sent messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert activities for others" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Hashtags policies (public read, system managed)
CREATE POLICY "Hashtags are publicly viewable" ON public.hashtags
  FOR SELECT USING (true);

-- Post hashtags policies
CREATE POLICY "Post hashtags are viewable with posts" ON public.post_hashtags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_hashtags.post_id 
      AND (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = posts.user_id 
          AND (users.is_private = false OR users.id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can insert hashtags for own posts" ON public.post_hashtags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_hashtags.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Comment likes policies
CREATE POLICY "Users can view comment likes" ON public.comment_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.comments 
      JOIN public.posts ON posts.id = comments.post_id
      WHERE comments.id = comment_likes.comment_id 
      AND (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = posts.user_id 
          AND (users.is_private = false OR users.id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can like comments" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id); 