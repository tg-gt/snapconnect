I'll create a comprehensive PRD for the MVP submission that can be broken down into actionable tasks for AI-driven development.

# Product Requirements Document: SnapConnect MVP
## Snapchat Clone with Core Social Features

### Executive Summary
Build a functional Snapchat clone with essential social features including camera functionality, ephemeral messaging, friend management, and stories. This MVP serves as the foundation for Phase 2 RAG enhancements.

### Target User & Use Cases
**Primary User:** Social Connectors - College students sharing campus life and maintaining friendships
**MVP Scope:** Core social sharing without RAG features

---

## Core User Stories

### 1. Camera & Media Capture
- **As a user**, I want to take photos and videos using the in-app camera
- **As a user**, I want to apply basic filters and effects to my photos
- **As a user**, I want to add text overlays and drawings to my snaps

### 2. Ephemeral Messaging
- **As a user**, I want to send photos/videos that disappear after viewing
- **As a user**, I want to set custom timer durations (3-10 seconds)
- **As a user**, I want to see if someone has viewed my snap

### 3. Friend Management
- **As a user**, I want to add friends by username or phone number
- **As a user**, I want to accept/decline friend requests
- **As a user**, I want to see my friends list and their online status

### 4. Stories Feature
- **As a user**, I want to post snaps to my story that last 24 hours
- **As a user**, I want to view friends' stories in a feed
- **As a user**, I want to see who viewed my story

### 5. Real-time Messaging
- **As a user**, I want to send text messages to friends
- **As a user**, I want to see typing indicators and read receipts
- **As a user**, I want message history (non-ephemeral chat)

### 6. User Profile
- **As a user**, I want to customize my profile with avatar and bio
- **As a user**, I want to see my snap score and streak counts
- **As a user**, I want to manage privacy settings

---

## Technical Requirements

### New Dependencies Needed
```json
{
  "expo-camera": "~16.1.8",
  "expo-media-library": "~17.1.7",
  "expo-av": "~15.1.6",
  "expo-image-picker": "~16.1.4",
  "expo-gl": "~15.1.6",
  "expo-gl-cpp": "~11.4.0",
  "react-native-svg": "^15.12.0",
  "react-native-gesture-handler": "~2.26.0",
  "react-native-reanimated": "~3.15.0"
}
```

### Database Schema Extensions (Supabase)

#### Users Table Enhancement
```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS snap_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
```

#### New Tables
```sql
-- Friends relationships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Snaps (ephemeral messages)
CREATE TABLE snaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL, -- photo, video
  caption TEXT,
  duration INTEGER DEFAULT 3, -- seconds
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  caption TEXT,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Story views
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Chat messages (persistent)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, snap, media
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Feature Specifications

### 1. Camera Module
**Files to Create:**
- `components/camera/CameraView.tsx`
- `components/camera/FilterControls.tsx`
- `components/camera/MediaPreview.tsx`

**Key Features:**
- Front/back camera toggle
- Photo/video capture with preview
- Basic filters (brightness, contrast, saturation)
- Text overlay and drawing tools
- Timer functionality

### 2. Snap Sharing System
**Files to Create:**
- `components/snap/SnapComposer.tsx`
- `components/snap/SnapViewer.tsx`
- `components/snap/SnapTimer.tsx`

**Key Features:**
- Select recipients from friends list
- Set viewing duration (3-10 seconds)
- Auto-delete after expiration
- View tracking and notifications

### 3. Friend Management
**Files to Create:**
- `components/friends/FriendsList.tsx`
- `components/friends/AddFriend.tsx`
- `components/friends/FriendRequests.tsx`

**Key Features:**
- Search users by username
- Send/accept/decline friend requests
- Friends list with online status
- Block/unblock functionality

### 4. Stories Feature
**Files to Create:**
- `components/stories/StoryCreator.tsx`
- `components/stories/StoryViewer.tsx`
- `components/stories/StoriesFeed.tsx`

**Key Features:**
- Create stories with 24-hour expiration
- Swipe navigation between stories
- View count and viewer list
- Automatic story deletion

### 5. Messaging System
**Files to Create:**
- `components/chat/ChatList.tsx`
- `components/chat/ChatScreen.tsx`
- `components/chat/MessageBubble.tsx`

**Key Features:**
- Real-time messaging with Supabase Realtime
- Typing indicators
- Read receipts
- Message history

### 6. Enhanced Navigation
**Files to Update:**
- `app/(protected)/(tabs)/_layout.tsx` - Add camera, chat, stories tabs
- `app/(protected)/(tabs)/camera.tsx` - New camera screen
- `app/(protected)/(tabs)/chat.tsx` - Chat list screen
- `app/(protected)/(tabs)/stories.tsx` - Stories feed screen

---

## Implementation Plan

### Phase 1A: Core Infrastructure (Day 1)
1. **Database Setup**
   - Create/update Supabase tables
   - Set up storage buckets for media
   - Configure RLS policies

2. **Basic Navigation**
   - Add camera, chat, stories tabs
   - Create placeholder screens
   - Update routing structure

3. **Camera Integration**
   - Install camera dependencies
   - Create basic camera view
   - Implement photo/video capture

### Phase 1B: Media & Sharing (Day 2)
1. **Media Management**
   - Upload to Supabase Storage
   - Create media preview component
   - Implement basic filters

2. **Snap System**
   - Create snap composer
   - Implement recipient selection
   - Add timer functionality

3. **Friend System Foundation**
   - User search functionality
   - Friend request system
   - Friends list display

### Phase 1C: Social Features (Day 3)
1. **Stories Implementation**
   - Story creation flow
   - Stories feed with swipe navigation
   - View tracking system

2. **Real-time Messaging**
   - Chat interface
   - Supabase Realtime integration
   - Message history

3. **Profile & Settings**
   - User profile page
   - Settings screen
   - Privacy controls

---

## Success Criteria

### Functional Requirements
- [ ] Users can register, login, and logout
- [ ] Users can take photos/videos with in-app camera
- [ ] Users can send ephemeral snaps that disappear after viewing
- [ ] Users can add friends and manage friend requests
- [ ] Users can create and view 24-hour stories
- [ ] Users can send real-time text messages
- [ ] Users can customize their profile

### Technical Requirements
- [ ] App works on both iOS and Android
- [ ] Real-time features work without refresh
- [ ] Media uploads successfully to Supabase Storage
- [ ] Ephemeral messages auto-delete properly
- [ ] App handles offline/online states gracefully

### Performance Requirements
- [ ] Camera launches within 2 seconds
- [ ] Media uploads complete within 10 seconds
- [ ] Messages send/receive within 1 second
- [ ] Stories load within 3 seconds
- [ ] App remains responsive during media processing

---

## Task Breakdown for AI Development

### Phase 1 Tasks
1. **Setup Database Schema** - Create all required Supabase tables and policies
2. **Install Camera Dependencies** - Add required packages and configure
3. **Create Camera Component** - Basic photo/video capture functionality
4. **Update Navigation** - Add new tabs and routing structure
5. **Create Media Upload Service** - Supabase Storage integration

### Phase 2 Tasks
1. **Build Snap Composer** - Complete snap creation and sending flow
2. **Implement Friend System** - Search, add, and manage friends
3. **Create Basic Filters** - Photo enhancement tools
4. **Add Timer System** - Ephemeral message expiration
5. **Build Chat Interface** - Real-time messaging foundation

### Phase 3 Tasks
1. **Implement Stories Feature** - Complete stories creation and viewing
2. **Add Real-time Updates** - Supabase Realtime integration
3. **Build Profile Management** - User profiles and settings
4. **Testing & Bug Fixes** - Ensure all features work properly
5. **Deployment Preparation** - Ready for MVP submission

This PRD provides a clear roadmap for building the MVP with specific, actionable tasks that can be executed through AI-driven development using Cursor Agent mode.