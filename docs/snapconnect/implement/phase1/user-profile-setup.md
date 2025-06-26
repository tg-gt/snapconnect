# User Profile Auto-Creation Setup

## Overview
This system automatically creates user profiles in the `public.users` table when someone signs up (gets added to `auth.users`). This prevents the "user not found" errors when users first visit their profile page.

## Setup Instructions

### 1. Run the SQL Setup Script
In your Supabase dashboard:
1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `config/setup-user-triggers.sql`
4. Click **Run**

### 2. Verify the Setup
The script will:
- ✅ Create trigger functions with error handling
- ✅ Set up the database trigger on `auth.users`
- ✅ Backfill existing auth users who don't have profiles
- ✅ Log success/error messages

Check the logs in Supabase dashboard under **Logs** > **Database**.

### 3. Test the System
Create a new user account and verify:
1. User appears in `auth.users` (authentication table)
2. User automatically appears in `public.users` (profile table)
3. Username is generated properly
4. Profile page loads without errors

## How It Works

### Username Generation
1. **Priority order** for username generation:
   - Custom `username` from metadata (if provided during signup)
   - OAuth `preferred_username` (Google, GitHub, etc.)
   - Email prefix (part before @)
   - Fallback to `user`

2. **Cleaning process**:
   - Convert to lowercase
   - Remove special characters (keep only a-z, 0-9, _)
   - Limit to 25 characters (leaves room for counter)

3. **Uniqueness handling**:
   - If username exists, append numbers: `john`, `john1`, `john2`, etc.
   - Safety limit of 9999 iterations
   - Ultimate fallback: `user` + timestamp

### Profile Data Mapping
```sql
auth.users              →  public.users
├── id                  →  id (same UUID)
├── email               →  email
├── metadata.username   →  username (processed)
├── metadata.full_name  →  full_name
├── metadata.avatar_url →  avatar_url
├── created_at          →  created_at
└── updated_at          →  updated_at

-- Default values:
├── bio                 →  NULL
├── website             →  NULL
├── is_private          →  FALSE
├── posts_count         →  0
├── followers_count     →  0
└── following_count     →  0
```

## Error Handling

### Graceful Degradation
- If trigger fails, auth user creation still succeeds
- Errors are logged but don't prevent signup
- Backfill handles edge cases for existing users

### Race Condition Protection
- Username uniqueness is checked twice (before and during insert)
- Timestamp-based fallback for extreme edge cases
- Retry logic with safety limits

### Logging
All operations are logged with detailed messages:
- Successful profile creations
- Username collisions and resolutions
- Errors and their causes
- Backfill progress

## Maintenance

### View Recent Logs
```sql
-- Check recent trigger activity
SELECT * FROM logs 
WHERE message LIKE '%user profile%' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Manual Profile Creation (if needed)
```sql
-- Create profile for specific auth user
SELECT public.handle_new_user() 
WHERE auth_user_id = 'your-user-id-here';
```

### Trigger Status Check
```sql
-- Verify trigger exists and is active
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## Troubleshooting

### Common Issues

**1. "Function does not exist" error**
- Re-run the setup script
- Check database permissions

**2. Duplicate username errors**  
- The system handles this automatically
- Check logs for resolution details

**3. Missing profiles for existing users**
- Run the backfill section of the setup script again
- Check for specific user errors in logs

**4. Trigger not firing**
- Verify trigger exists in `information_schema.triggers`
- Check RLS policies aren't blocking the function

### Manual Cleanup (if needed)
```sql
-- Remove trigger and functions (only if you need to start over)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS generate_unique_username(TEXT);
```

## Benefits

### For Users
- ✅ Seamless signup experience
- ✅ Profile page works immediately
- ✅ No setup steps required
- ✅ Works with all auth methods (email, OAuth, etc.)

### For Development
- ✅ No app code changes needed
- ✅ Handles edge cases automatically
- ✅ Comprehensive error logging
- ✅ Backfills existing users

### For Operations
- ✅ Self-healing system
- ✅ Detailed logging for monitoring
- ✅ Graceful error handling
- ✅ Easy to maintain and debug

The system is now production-ready and will handle all user signups automatically! 🚀 