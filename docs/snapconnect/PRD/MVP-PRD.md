I'll create a comprehensive PRD for the MVP submission that can be broken down into actionable tasks for AI-driven development.

# Product Requirements Document: SnapConnect MVP
## Instagram Clone with Core Social Features

### Executive Summary
Build a functional Instagram clone with essential social features including photo/video posts, feed consumption, social interactions (likes/comments), discovery, and profile management. This MVP serves as the foundation for Phase 2 RAG enhancements.

### Target User & Use Cases
**Primary User:** Social Connectors - College students sharing campus life and maintaining friendships
**MVP Scope:** Core social sharing with permanent content model

---

## Core User Stories

### 1. Feed Consumption & Discovery
- **As a user**, I want to view a personalized feed of posts from accounts I follow
- **As a user**, I want to scroll through posts with infinite scrolling
- **As a user**, I want to explore trending content and discover new accounts

### 2. Post Creation & Sharing
- **As a user**, I want to create posts with photos/videos, captions, and hashtags
- **As a user**, I want to share multiple photos in a single post (carousel)
- **As a user**, I want to tag my location and other users in posts

### 3. Social Interactions
- **As a user**, I want to like and comment on posts
- **As a user**, I want to see who liked my posts and respond to comments
- **As a user**, I want to share posts with friends via direct messages

### 4. Profile Management
- **As a user**, I want to curate my profile with a grid of my posts
- **As a user**, I want to edit my bio, profile picture, and account settings
- **As a user**, I want to see my follower/following counts and post statistics

### 5. Follow System
- **As a user**, I want to follow/unfollow accounts to customize my feed
- **As a user**, I want to see follow suggestions based on mutual connections
- **As a user**, I want to manage followers (approve/remove for private accounts)

### 6. Stories Feature
- **As a user**, I want to post ephemeral stories that disappear after 24 hours
- **As a user**, I want to view friends' stories in a separate stories bar
- **As a user**, I want to see who viewed my stories

### 7. Direct Messaging
- **As a user**, I want to send private messages to other users
- **As a user**, I want to share posts directly via DMs
- **As a user**, I want to see message status and typing indicators

---

## Technical Requirements

### New Dependencies Needed
```json
{
  "expo-camera": "~16.1.8",
  "expo-media-library": "~17.1.7",
  "expo-av": "~15.1.6",
  "expo-image-picker": "~16.1.4",
  "expo-image-manipulator": "~13.1.4",
  "react-native-svg": "^15.12.0",
  "@expo/vector-icons": "^14.2.2",
  "expo-gl": "~15.1.6"
}
```
*Note: react-native-gesture-handler and react-native-reanimated already exist*

### Database Schema (Supabase)

#### Core Tables Setup
```sql
-- Enhanced users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  website VARCHAR(255),
  is_private BOOLEAN DEFAULT FALSE,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts (permanent content)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  location TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post media (supports carousels)
CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL, -- photo, video
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes system
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Comments system  
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comment likes
CREATE TABLE comment_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, comment_id)
);

-- Follow system
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'approved', -- approved, pending (for private accounts)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Hashtags
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_hashtags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY(post_id, hashtag_id)
);

-- Stories (ephemeral content)
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

-- Direct messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, post_share, media
  post_id UUID REFERENCES posts(id), -- for shared posts
  media_url TEXT, -- for direct media
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity feed (notifications)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- recipient
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE, -- who performed action
  activity_type VARCHAR(20) NOT NULL, -- like, comment, follow, mention
  post_id UUID REFERENCES posts(id),
  comment_id UUID REFERENCES comments(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Real-time Subscriptions Required
- **posts** - for new posts in feed
- **likes** - for real-time like counts
- **comments** - for live comment updates
- **follows** - for follow notifications
- **messages** - for direct messaging
- **activities** - for activity notifications
- **story_views** - for story view tracking

#### RLS Policies Setup
*Note: Basic security model - detailed policies to be configured during implementation*
- Users can see posts from public accounts and accounts they follow
- Private account posts only visible to approved followers
- Users can only edit their own content
- Activity notifications only visible to the recipient
- Messages only visible to sender/recipient

---

## Navigation Architecture

### Instagram-Style Tab Structure
```
Home | Search | Create | Activity | Profile
```

**5-tab navigation implementing Instagram's core structure:**
1. **Home** - Feed of posts from followed accounts
2. **Search** - Explore trending content and discover accounts  
3. **Create** - Post creation (camera/gallery) - center position
4. **Activity** - Likes, comments, follows notifications
5. **Profile** - User profile with post grid

**Current tabs (Home, Settings) will be completely replaced with Instagram navigation**

### Screen Hierarchy
```
App
├── (auth)
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── welcome.tsx
└── (protected)
    ├── (tabs)
    │   ├── home.tsx           // Feed of posts
    │   ├── search.tsx         // Explore/Discovery
    │   ├── create.tsx         // Post creation
    │   ├── activity.tsx       // Notifications
    │   └── profile.tsx        // User profile grid
    ├── post-details.tsx       // Individual post view
    ├── story-viewer.tsx       // Stories interface
    ├── user-profile.tsx       // Other users' profiles
    ├── edit-profile.tsx       // Profile editing
    ├── messages/
    │   ├── index.tsx          // DM inbox
    │   └── chat.tsx           // Individual chat
    └── camera/
        ├── capture.tsx        // Camera interface
        └── edit.tsx           // Post editing
```

---

## Feature Specifications

### 1. Home Feed
**Files to Create:**
- `components/feed/PostList.tsx`
- `components/feed/PostCard.tsx`
- `components/feed/StoriesBar.tsx`

**Key Features:**
- Infinite scroll feed of posts
- Stories bar at top
- Pull-to-refresh functionality
- Like/comment interactions
- Post sharing

### 2. Post Creation System
**Files to Create:**
- `components/create/CameraCapture.tsx`
- `components/create/PostEditor.tsx`
- `components/create/CaptionEditor.tsx`

**Key Features:**
- Camera/gallery photo selection
- Multi-photo carousel creation
- Caption and hashtag editing
- Location tagging
- Story vs Post toggle

### 3. Social Interactions
**Files to Create:**
- `components/social/LikeButton.tsx`
- `components/social/CommentSection.tsx`
- `components/social/ShareSheet.tsx`

**Key Features:**
- Double-tap to like posts
- Comment threads with likes
- Share posts via DM
- Activity notifications

### 4. Profile Management
**Files to Create:**
- `components/profile/ProfileHeader.tsx`
- `components/profile/PostGrid.tsx` 
- `components/profile/EditProfile.tsx`

**Key Features:**
- Profile statistics (posts/followers/following)
- Photo grid layout
- Bio and profile picture editing
- Follow/unfollow functionality

### 5. Discovery & Search
**Files to Create:**
- `components/search/SearchBar.tsx`
- `components/search/ExploreGrid.tsx`
- `components/search/UserSearch.tsx`

**Key Features:**
- Hashtag and user search
- Trending content grid
- User discovery suggestions
- Search history

### 6. Stories System
**Files to Create:**
- `components/stories/StoryCreator.tsx`
- `components/stories/StoryViewer.tsx`
- `components/stories/StoriesRing.tsx`

**Key Features:**
- 24-hour ephemeral stories
- Story creation with camera
- Stories bar with user rings
- View tracking

### 7. Messaging System
**Files to Create:**
- `components/messages/MessagesList.tsx`
- `components/messages/ChatScreen.tsx`
- `components/messages/PostShare.tsx`

**Key Features:**
- Direct message conversations
- Post sharing in messages
- Media sharing in DMs
- Read receipts

---

## Implementation Plan

### Phase 1A: Core Feed Infrastructure (Day 1)
1. **Database & Storage Setup**
   - Deploy complete Instagram schema
   - Configure media storage buckets
   - Set up basic RLS policies

2. **Navigation & Feed Foundation**
   - Implement 5-tab Instagram navigation
   - Create basic home feed with infinite scroll
   - Set up post data models

3. **Post Creation Basics**
   - Camera/gallery integration
   - Basic photo upload functionality
   - Simple post creation flow

### Phase 1B: Social Features & Interactions (Day 2)
1. **Social Engagement System**
   - Like/unlike functionality
   - Comment system with threads
   - Real-time engagement updates

2. **Profile System**
   - User profile with post grid
   - Follow/unfollow functionality  
   - Profile editing capabilities

3. **Discovery & Search**
   - Basic search functionality
   - Hashtag support
   - User discovery

### Phase 1C: Stories & Advanced Features (Day 3)
1. **Stories Implementation**
   - Story creation and viewing
   - Stories bar in home feed
   - 24-hour expiration system

2. **Activity & Messaging**
   - Activity notifications feed
   - Basic direct messaging
   - Post sharing functionality

3. **Polish & Testing**
   - UI refinements
   - Performance optimizations
   - Bug fixes and testing

---

## Success Criteria

### Functional Requirements
- [ ] Users can create accounts and set up profiles
- [ ] Users can create posts with photos/videos and captions
- [ ] Users can view a personalized home feed
- [ ] Users can like and comment on posts
- [ ] Users can follow/unfollow other users
- [ ] Users can search and discover content/users
- [ ] Users can create and view 24-hour stories
- [ ] Users can send direct messages

### Technical Requirements
- [ ] App works on both iOS and Android
- [ ] Real-time updates for likes/comments
- [ ] Media uploads successfully to Supabase Storage
- [ ] Infinite scroll performs smoothly
- [ ] Stories auto-delete after 24 hours
- [ ] App handles offline states gracefully

### Performance Requirements
- [ ] Feed loads within 3 seconds
- [ ] Post creation completes within 10 seconds
- [ ] Like/comment actions respond within 1 second
- [ ] Search results appear within 2 seconds
- [ ] Stories load and play smoothly
- [ ] App maintains 60fps during scrolling

---

## Decisions Made Now vs Later

### ✅ **NOW (Critical for MVP architecture):**
- Navigation structure (5-tab Instagram layout)
- Database schema (complete Instagram data model)
- Content model (permanent posts vs ephemeral)
- Real-time subscription requirements
- Core component architecture
- Feed-first user experience flow

### ⏳ **LATER (Implementation details):**
- Advanced camera filters and editing
- Exact recommendation algorithms
- Push notification configurations
- Advanced privacy controls
- Content moderation systems
- Analytics and insights
- Advanced messaging features

### 🤔 **Flexible (Can adapt during development):**
- Post editing capabilities
- Story advanced features (polls, questions)
- Comment moderation tools
- Account verification systems
- Advertising integration points
- Advanced search filters

This PRD provides a clear roadmap for building an Instagram MVP with specific, actionable tasks that can be executed through AI-driven development using Cursor Agent mode.