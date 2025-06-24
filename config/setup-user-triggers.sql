-- ============================================
-- Auto-Create User Profiles on Signup
-- ============================================
-- This script sets up triggers to automatically create a user profile 
-- in public.users when someone signs up (gets added to auth.users)

-- 1. Helper function to generate unique usernames
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean the base username: lowercase, remove special chars, limit length
  clean_username := LOWER(REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  clean_username := LEFT(clean_username, 25); -- Leave room for counter suffix
  
  -- If empty after cleaning, use default
  IF LENGTH(clean_username) = 0 OR clean_username = '' THEN
    clean_username := 'user';
  END IF;
  
  final_username := clean_username;
  
  -- Ensure uniqueness by adding counter if needed
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := clean_username || counter::TEXT;
    
    -- Safety check to prevent infinite loops
    IF counter > 9999 THEN
      final_username := 'user' || extract(epoch from now())::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Main function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_username TEXT;
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  -- Validate that we have required data
  IF NEW.id IS NULL THEN
    RAISE LOG 'Cannot create user profile: missing user ID';
    RETURN NEW;
  END IF;
  
  -- Get email (required field)
  user_email := COALESCE(NEW.email, '');
  IF user_email = '' THEN
    RAISE LOG 'Cannot create user profile for %: missing email', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Generate unique username from available data
  new_username := generate_unique_username(
    COALESCE(
      NEW.raw_user_meta_data->>'username',           -- Custom username if provided
      NEW.raw_user_meta_data->>'preferred_username', -- OAuth preferred username
      split_part(user_email, '@', 1),                -- Email prefix
      'user'                                         -- Fallback
    )
  );
  
  -- Get full name from metadata with multiple fallback options
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',     -- Explicit full_name
    NEW.raw_user_meta_data->>'name',          -- Generic name field
    NEW.raw_user_meta_data->>'display_name',  -- Display name
    split_part(user_email, '@', 1),           -- Email prefix
    new_username                              -- Generated username as last resort
  );
  
  -- Insert new user profile
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    bio,
    avatar_url,
    website,
    is_private,
    posts_count,
    followers_count,
    following_count,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_email,
    new_username,
    user_full_name,
    NULL,                                     -- No bio initially
    NEW.raw_user_meta_data->>'avatar_url',    -- Avatar from OAuth if available
    NULL,                                     -- No website initially
    FALSE,                                    -- Default to public profile
    0,                                        -- Start with 0 posts
    0,                                        -- Start with 0 followers
    0,                                        -- Start with 0 following
    COALESCE(NEW.created_at, NOW()),          -- Use auth creation time or now
    COALESCE(NEW.updated_at, NOW())           -- Use auth update time or now
  );
  
  RAISE LOG 'Created user profile for % with username %', NEW.id, new_username;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition where username was taken between check and insert
    RAISE LOG 'Username collision for user %, retrying...', NEW.id;
    
    -- Generate a timestamp-based username as fallback
    new_username := 'user' || extract(epoch from now())::TEXT;
    
    INSERT INTO public.users (
      id, email, username, full_name, is_private, 
      posts_count, followers_count, following_count, created_at, updated_at
    ) VALUES (
      NEW.id, user_email, new_username, user_full_name, FALSE,
      0, 0, 0, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW())
    );
    
    RAISE LOG 'Created user profile for % with fallback username %', NEW.id, new_username;
    RETURN NEW;
    
  WHEN OTHERS THEN
    -- Log error but don't prevent auth user creation
    RAISE LOG 'Error creating user profile for % (%): %', NEW.id, user_email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Update RLS policy to allow the trigger function to insert
-- (The trigger runs as SECURITY DEFINER so it has elevated privileges)

-- 6. Backfill existing auth users who don't have profiles
-- This handles users who signed up before the trigger was created
DO $$
DECLARE
  auth_user RECORD;
  new_username TEXT;
  user_full_name TEXT;
  backfill_count INTEGER := 0;
BEGIN
  RAISE LOG 'Starting backfill of existing auth users without profiles...';
  
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at, au.updated_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL -- Auth users without corresponding public user profile
  LOOP
    BEGIN
      -- Generate username for this user
      new_username := generate_unique_username(
        COALESCE(
          auth_user.raw_user_meta_data->>'username',
          auth_user.raw_user_meta_data->>'preferred_username',
          split_part(auth_user.email, '@', 1),
          'user'
        )
      );
      
      -- Get full name
      user_full_name := COALESCE(
        auth_user.raw_user_meta_data->>'full_name',
        auth_user.raw_user_meta_data->>'name',
        auth_user.raw_user_meta_data->>'display_name',
        split_part(auth_user.email, '@', 1),
        new_username
      );
      
      -- Insert the missing profile
      INSERT INTO public.users (
        id, email, username, full_name, bio, avatar_url, website, is_private,
        posts_count, followers_count, following_count, created_at, updated_at
      ) VALUES (
        auth_user.id,
        auth_user.email,
        new_username,
        user_full_name,
        NULL,
        auth_user.raw_user_meta_data->>'avatar_url',
        NULL,
        FALSE,
        0, 0, 0,
        COALESCE(auth_user.created_at, NOW()),
        COALESCE(auth_user.updated_at, NOW())
      );
      
      backfill_count := backfill_count + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE LOG 'Error backfilling user %: %', auth_user.id, SQLERRM;
        CONTINUE;
    END;
  END LOOP;
  
  RAISE LOG 'Backfill completed: % users processed', backfill_count;
END;
$$;

-- 7. Verify the setup
DO $$
BEGIN
  RAISE LOG 'User profile auto-creation setup completed successfully!';
  RAISE LOG 'Trigger: on_auth_user_created is now active';
  RAISE LOG 'Functions: handle_new_user() and generate_unique_username() are ready';
  RAISE LOG 'All existing auth users have been backfilled with profiles';
END;
$$; 