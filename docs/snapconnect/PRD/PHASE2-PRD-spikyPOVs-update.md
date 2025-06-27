**Perfect!** Those decisions give us a rock-solid foundation. You've essentially defined a **"Event Operating System"** that organizers can deploy for their events. This is genuinely compelling - let me create the Phase 2 PRD now.

## **🔄 UPDATED VERSION - Simplified Architecture**

**Key Changes Made:**
- ✅ **Removed confusing "dual-mode navigation"** - Keep existing 5-tab Instagram layout
- ✅ **Integrated event features within existing tabs** - No separate navigation system
- ✅ **Specified AI stack** - Pinecone/Supabase pgvector + OpenAI CLIP + GPT-4V
- ✅ **Simplified privacy approach** - Removed screenshot detection, moderate geofencing accuracy
- ✅ **Enhanced profile editing** - Pseudonymous handles, about me, location info
- ✅ **Modal-based detail screens** - Quest details, maps, leaderboards accessed from existing tabs

---

```markdown
# Product Requirements Document: SnapConnect Phase 2
## Event Social Operating System with Privacy-First Gamification

### Executive Summary
Transform the existing SnapConnect Instagram MVP into a dedicated event social platform. Phase 2 creates a **temporary, private Instagram deployment per event** - users join a specific event and the entire app becomes that event's social network. This is NOT a dual-mode app - it's a single-purpose event operating system that organizers deploy as a privacy-first, gamified social layer for their specific event.

### Strategic Pivot & Market Opportunity
**Phase 1**: Instagram clone for college students (B2C social sharing)
**Phase 2**: Event social platform for event organizers (B2B engagement tools)

**Market Gap Identified**: No platform combines privacy-first design + social features + gamification specifically for events. Competitors like ConfyChat (messaging only), Mozi (friend tracking), and GooseChase (generic scavenger hunts) each solve pieces but miss the complete experience.

**Core Thesis - "Temporary, High-Trust Social Networks":**
- General public proximity-based social features are scary (safety concerns)
- Event environments create natural high-trust boundaries with barrier to entry
- Attendees can broadcast location, activities, beliefs more freely within event context
- "Level playing field" - everyone starts with 0 followers, encourages authentic, in-the-moment expression
- Ephemeral content removes "permanent consequences" anxiety

**Revenue Model**: B2B SaaS - Event organizers pay $500-5000 per event for white-label social experience included in ticket price.

---

## Core User Stories - Phase 2

### Event Organizers (Primary Customer)
- **As an organizer**, I want to deploy a custom social app for my event that increases attendee engagement and retention
- **As an organizer**, I want to create location-based quests and challenges that guide attendees through the venue
- **As an organizer**, I want real-time analytics on attendee behavior and popular activities
- **As an organizer**, I want to control content expiration (immediate to 1 week post-event)
- **As an organizer**, I want to integrate sponsors into quests and rewards naturally
- **As an organizer**, I want to moderate content and manage inappropriate behavior

### Event Attendees (End Users)  
- **As an attendee**, I want to join my event's private social network with a simple code
- **As an attendee**, I want to complete location-based quests and earn points/badges
- **As an attendee**, I want to share ephemeral content that creates urgency and excitement
- **As an attendee**, I want to discover other attendees with similar interests without revealing personal info
- **As an attendee**, I want to export my connections/photos before content expires
- **As an attendee**, I want to feel safe sharing without permanent consequences

---

## Technical Architecture Extensions

### New Dependencies Required
```json
{
  "expo-location": "~18.1.5",
  "expo-sensors": "~14.1.4",
  "expo-file-system": "latest",
  "expo-sharing": "latest", 
  "expo-haptics": "latest",
  "react-native-qrcode-svg": "^6.3.15",
  "@react-native-async-storage/async-storage": "^2.1.2" // already exists
  // Note: expo-camera (already installed) replaces deprecated expo-barcode-scanner
}
```

### Extended Database Schema

#### Data Model Philosophy: Event-First Architecture
**Key Change**: All content is event-scoped from creation. No "general social" content exists.
- Every post, story, comment, like is created within an event context
- `event_id` is required (NOT NULL) for all content tables
- No backwards compatibility needed - this is a strategic pivot, not feature addition

#### New Event System Tables
```sql
-- Events (main table for festivals/events)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location_name VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  event_code VARCHAR(20) UNIQUE NOT NULL, -- Join code for attendees
  content_expires_at TIMESTAMP, -- When all content auto-deletes
  max_participants INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  privacy_mode VARCHAR(20) DEFAULT 'private', -- private, public, invite_only
  screenshot_warnings BOOLEAN DEFAULT TRUE,
  allow_exports BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event participants
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(50), -- Anonymous display name for this event
  joined_at TIMESTAMP DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  quests_completed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(20) DEFAULT 'participant', -- participant, moderator, organizer
  UNIQUE(event_id, user_id)
);

-- Quest system
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  quest_type VARCHAR(30) NOT NULL, -- location, photo, social, scavenger, sponsor
  points_reward INTEGER DEFAULT 10,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_radius_meters INTEGER DEFAULT 50,
  required_photo BOOLEAN DEFAULT FALSE,
  unlock_condition TEXT, -- JSON for complex unlock logic
  time_limit_minutes INTEGER,
  max_completions INTEGER, -- null = unlimited
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quest completions
CREATE TABLE quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
  completion_data JSONB, -- Photos, text responses, etc.
  points_earned INTEGER,
  completed_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  UNIQUE(quest_id, participant_id)
);

-- Event-specific posts (extends existing posts table)
ALTER TABLE posts ADD COLUMN event_id UUID REFERENCES events(id) NOT NULL;
ALTER TABLE posts ADD COLUMN quest_id UUID REFERENCES quests(id);
ALTER TABLE posts ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN allow_screenshot BOOLEAN DEFAULT TRUE;

-- Event-specific stories (extends existing stories table)  
ALTER TABLE stories ADD COLUMN event_id UUID REFERENCES events(id) NOT NULL;

-- Story views for complex state management
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Content quality tracking
CREATE TABLE content_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID, -- Can reference posts or stories
  content_type VARCHAR(20) NOT NULL, -- 'post' or 'story'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  engagement_score INTEGER DEFAULT 0,
  quality_signals JSONB, -- Likes, comments, shares, time spent viewing
  daily_limit_bonus INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI quest verification results
CREATE TABLE quest_ai_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_completion_id UUID REFERENCES quest_completions(id) ON DELETE CASCADE,
  verification_type VARCHAR(30) NOT NULL, -- photo_analysis, location_check, etc.
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_analysis JSONB, -- Detailed AI analysis results
  verified_automatically BOOLEAN DEFAULT FALSE,
  requires_human_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quest appeals (simple organizer review)
CREATE TABLE quest_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_completion_id UUID REFERENCES quest_completions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES users(id), -- organizer who reviewed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  rank_position INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

-- Export requests (for data portability)
CREATE TABLE export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  export_type VARCHAR(30) NOT NULL, -- contacts, photos, notes, achievements
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, expired
  download_url TEXT,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Privacy settings (simplified)
CREATE TABLE user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  geofenced_only BOOLEAN DEFAULT TRUE,
  audience_scope VARCHAR(30) DEFAULT 'all_participants', -- all_participants, connections_only, activity_based
  content_expires_with_event BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

### Navigation Architecture - Single-Purpose Event App

#### Core Architecture: Temporary Instagram Per Event
Users download the app → Join specific event → Experience a private Instagram clone scoped to that event only.

**Key Principle**: No general social features. All functionality is event-scoped from the moment users join.

```
Home Tab               Search Tab            Create Tab
├── Event social feed  ├── Event participants├── Post/Story creation
├── Event stories bar  ├── Quest discovery   ├── Quest photo submission
├── Active quests      ├── Join event w/code ├── Location quest completion
├── Quest widgets      └── [Event-only search] └── Quest verification
└── [Event-only content]

Activity Tab           Profile Tab
├── Quest completions    ├── Event profile (pseudonymous)
├── Event achievements   ├── Event handle editing
├── Event notifications  ├── Event bio/info
├── Leaderboard updates  ├── Quest history
└── Social interactions  └── Event achievements
```

#### MVP Scope: Single Event Per User
- Users join **one event at a time** (no event switching)
- All app state and content scoped to current event
- Multi-event "workspace" functionality deferred to Phase 3
- Simpler architecture and user experience

**Modal/Detail Screens** (accessed from tabs, not separate navigation):
- Event join modal (from Search)
- Quest detail screens (from Home)
- Event map (from Home quest widgets)
- Leaderboard (from Activity)
- Organizer dashboard (separate access)

### Enhanced Feed Architecture
**Dual-Feed System (X/Twitter style):**
- **Following Feed**: Reverse chronological (newest first), users you've connected with at event
- **Discovery Feed**: Algorithmic reranking by engagement + interest matching

**Key Principle**: Default to reverse chronological even if other content has more engagement
- Prevents "popularity spiral" where early posts dominate entire event
- Encourages fresh content creation throughout event duration
- Gives everyone equal opportunity for visibility regardless of early adoption

**Stories Display Logic:**
- Stories shown in reverse chronological order (most recent first)
- Complex state management for mid-sequence additions:
  - Display all stories in chronological order
  - Visual indicators: Unwatched (normal), Watched (grayed), New since last view (highlighted)
  - Database: `story_views` table with (user_id, story_id, viewed_at)
  - Continue from last unwatched + highlight new stories

### Granular Privacy Controls
**Contextual Broadcasting Philosophy:**
High-trust event environments allow more open sharing than general public social networks. Users can granularly control their broadcast settings:

**Geofenced Visibility:**
- Content only visible within event boundaries (moderate GPS accuracy ±100m)
- Automatic content hiding when users leave event area
- **Implementation Strategy**: Simple distance calculation with generous radius (±500m)
- Prioritizes user experience over strict geo-enforcement
- Relies on event barrier-to-entry for primary security

**Audience Controls:**
- **All Participants**: Visible to everyone at the event
- **Connections Only**: Visible to people you've interacted with
- **Activity-Based**: Only visible to people doing similar quests/activities
- **Time-Bounded**: Expires at event end vs custom duration

**Situational Identity:**
- Anonymous event usernames (detached from real identity)
- Optional real name reveal for specific connections
- No imported follower counts or external social proof
- Fresh start encourages authentic, in-the-moment personality

#### Screen Hierarchy - Single Event Architecture
```
App
├── (auth) [existing - but leads to event joining, not general social]
└── (protected) [event-scoped from login]
    ├── (tabs) [Instagram navigation - ALL content is event-specific]
    │   ├── index.tsx             // Home: Event feed + stories + quest widgets
    │   ├── search.tsx            // Search: Event participants + join event flow
    │   ├── create.tsx            // Create: Event posts/stories + quest submissions
    │   ├── activity.tsx          // Activity: Event notifications + achievements
    │   └── profile.tsx           // Profile: Event-scoped profile + quest history
    ├── event-join.tsx            // Modal: Join event with code (first-time flow)
    ├── quest-detail.tsx          // Modal: Individual quest details
    ├── quest-camera.tsx          // Modal: Photo/video capture for quests
    ├── event-map.tsx             // Modal: Interactive venue map
    ├── leaderboard.tsx           // Modal: Rankings and achievements
    ├── ai-verification.tsx       // Screen: Quest verification results
    ├── organizer/
    │   ├── dashboard.tsx         // Organizer analytics
    │   ├── quest-builder.tsx     // Create/edit quests
    │   ├── event-settings.tsx    // Event configuration
    │   └── moderation.tsx        // Content moderation
    └── export/
        ├── data-export.tsx       // Export personal data
        └── export-status.tsx     // Download status
```

---

## Feature Specifications - Phase 2

### 1. Event Discovery & Joining (Enhanced Search Tab)
**Files to Enhance:**
- `app/(protected)/(tabs)/search.tsx` - Add event discovery section
- `app/(protected)/event-join.tsx` - Modal for joining events
- `components/events/EventCard.tsx`
- `components/events/JoinEventModal.tsx`

**Key Features:**
- Browse nearby/featured events (integrated in Search tab)
- Join with event code or QR scan
- Event preview with details
- Capacity and timing restrictions

**User Flow:**
1. User downloads app and creates account
2. User discovers/joins event via code/QR or event discovery
3. User creates pseudonymous event profile (separate from any "real" identity)
4. App transforms into private Instagram for that specific event
5. All tabs now show event-scoped content only - no general social features

### 2. Quest System (Home Tab Widgets + Modals)
**Files to Create:**
- `app/(protected)/quest-detail.tsx` - Modal for individual quest details
- `app/(protected)/quest-camera.tsx` - Modal for photo/video capture
- `app/(protected)/ai-verification.tsx` - Quest verification results screen
- `components/quests/QuestCard.tsx` - Widget for Home tab
- `components/quests/QuestProgress.tsx` - Progress tracking component
- `components/quests/LocationTracker.tsx` - Geofencing component
- `components/quests/AIVerificationStatus.tsx`
- `components/quests/VerificationAppeal.tsx`

**Integration Points:**
- Home tab: Quest widgets and active quest list
- Create tab: Quest photo submission integration
- Activity tab: Quest completion notifications

**Quest Types:**
- **Location-based**: Check-in at specific venue locations with moderate GPS accuracy (±100m)
- **Photo challenges**: AI-verified capture of specific scenes/objects
- **Social quests**: Meet other attendees, group photos with face detection
- **Scavenger hunts**: Find hidden QR codes/objects with computer vision
- **Sponsor integration**: Visit sponsor booths, try products with AI verification

**Technical Implementation Note:**
- **QR/Barcode Scanning**: Uses `expo-camera@16.1.9` with built-in barcode scanning (not deprecated `expo-barcode-scanner`)
- **Location Services**: Uses `expo-location@18.1.5` for GPS verification
- **Camera Integration**: `expo-camera` provides unified photo capture + barcode scanning capabilities

**Key Features:**
- **AI-Powered Verification**: RAG analysis of submitted photos/videos
- **Probabilistic Scoring**: 80%+ confidence threshold with acceptable false positives
- **Real-time location verification**: Moderate GPS accuracy, no manual fallbacks needed
- **Appeals Process**: Simple database table for organizer manual review
- **Progress tracking**: Point systems with engagement-based bonuses
- **Unlockable quest chains**: Complex unlock conditions and dependencies
- **Time-limited challenges**: Urgency and scarcity mechanics

### 3. Enhanced Social Features (Within Existing Tabs)
**Files to Enhance/Create:**
- `app/(protected)/(tabs)/index.tsx` - Add event feed section to Home tab
- `app/(protected)/(tabs)/profile.tsx` - Enhanced profile editing for pseudonymous handles
- `components/events/EventPostCard.tsx` - Event-specific post styling
- `components/events/EphemeralContent.tsx` - Content with expiration
- `components/events/EventStoriesBar.tsx` - Event stories integration
- `components/feed/FeedToggle.tsx` - Following vs Discovery feed toggle
- `components/events/QualityScoreDisplay.tsx`
- `components/privacy/ContextualControls.tsx`

**Enhanced Social Features:**
- **Feed Enhancement**: Following (reverse chronological) + Discovery (algorithmic) in Home tab
- **Event-scoped content**: Only visible to event participants with privacy controls
- **Ephemeral posts**: Custom expiration (event end vs user-defined)
- **Pseudonymous handles**: User-editable display names for event contexts
- **Geofenced content**: Automatically hide content when users leave event area (moderate accuracy)
- **Quality incentives**: Flat daily content limits for all users
- **AI-powered discovery**: RAG-based content and people recommendations

### 4. Interactive Event Map (Modal Screen)
**Files to Create:**
- `app/(protected)/event-map.tsx` - Modal accessed from Home tab quest widgets
- `components/map/VenueMap.tsx`
- `components/map/QuestMarkers.tsx`
- `components/map/AttendeeHeatmap.tsx`

**Key Features:**
- Interactive venue layout
- Quest location markers with moderate geofencing accuracy
- Real-time attendee density (privacy-safe, aggregated)
- Points of interest and sponsor locations
- Offline map caching for poor connectivity

**Access Points:**
- Home tab quest widgets → "View Map" button
- Quest detail modals → "Show on Map" button

### 5. Gamification & Leaderboards (Activity Tab + Modal)
**Files to Create:**
- `app/(protected)/leaderboard.tsx` - Modal accessed from Activity tab
- `components/gamification/PointsDisplay.tsx` - Widget for Activity tab
- `components/gamification/AchievementBadges.tsx` - Achievement notifications
- `components/gamification/LeaderboardCard.tsx`

**Gamification Elements:**
- Point system for quest completion
- Achievement badges and unlockables
- Team-based challenges
- Real-time leaderboard updates
- Surprise bonus point opportunities

**Integration Points:**
- Activity tab: Achievement notifications and leaderboard preview
- Profile tab: Personal achievement history
- Quest completion: Points awarded notifications

### 6. Organizer Dashboard
**Files to Create:**
- `app/(protected)/organizer/dashboard.tsx`
- `app/(protected)/organizer/quest-builder.tsx`
- `app/(protected)/organizer/event-settings.tsx`
- `app/(protected)/organizer/moderation.tsx`
- `components/organizer/EventAnalytics.tsx`
- `components/organizer/QuestEditor.tsx`

**B2B Features:**
- Real-time event analytics
- Quest creation and editing tools
- Content moderation interface
- Participant management
- Sponsor integration tools
- Export attendee engagement data

### 7. Privacy Controls & Data Export (Profile Tab + Settings)
**Files to Create:**
- `app/(protected)/export/data-export.tsx` - Accessed from Profile settings
- `app/(protected)/export/export-status.tsx`
- `components/privacy/ExportControls.tsx`
- `components/privacy/EphemeralWarning.tsx`
- `components/privacy/PrivacySettings.tsx` - Integrated in Profile tab

**Privacy Features:**
- Selective data export (contacts, photos, achievements)
- Automatic content deletion timers
- Geofenced content visibility controls
- Audience scope settings (all participants, connections only, activity-based)
- GDPR-compliant data handling

**Integration Points:**
- Profile tab: Privacy settings and data export access
- Post creation: Privacy level selection
- Event joining: Privacy preferences setup

---

## Content Quality Incentive System

### Daily Content Limits
Prevent spam and encourage intentional sharing:

**Flat Daily Limits (No Quality-Based Increases):**
- Video content: 2 hours total per day
- Photos: 20 photos per day  
- Stories: 10 stories per day
- Posts: 5 posts per day

**Implementation:**
- Limits are configurable constants in source code
- No engagement-based unlocks or quality scoring
- All participants have equal posting opportunities
- Quest completion does not increase limits

### Post-Event Experience
**Highlight Reel Generation:**
- AI curates personal "best moments" compilation
- Exportable recap video with music and transitions
- Option to create collaborative event highlight reels
- Memory preservation before content deletion

**Connection Persistence:**
- Optional real contact info exchange before event ends
- LinkedIn-style connection requests with context
- "Keep in touch" feature for meaningful connections
- Export contact list with notes about how you met

---

## AI-Powered Features

### AI Stack Specification
**Vector Database & Embeddings:**
- **Pinecone** or **Supabase pgvector** for vector storage
- **OpenAI CLIP** for image/video embeddings and analysis
- **OpenAI GPT-4V** for detailed quest verification
- **OpenAI API Key**: Stored in `.env` file (`OPENAI_API_KEY=your_key_here`)
- **No rate limiting required for MVP** - single event testing focus

### Quest Verification with RAG
**Computer Vision Quest Verification:**
- CLIP embeddings + GPT-4V analysis of submitted photos/videos
- 80%+ confidence threshold for automatic verification
- Probabilistic verification adds "game-like randomness"
- Appeals process for disputed completions
- Some false positives acceptable (adds fun unpredictability)

**Example Quest Types:**
- "Take a photo with someone wearing a red hat" → Face detection + color analysis
- "Capture the main stage during a performance" → Scene recognition + audio analysis
- "Find the hidden QR code near the food trucks" → QR detection via `expo-camera` + moderate GPS location check

**QR/Barcode Scanning Implementation:**
```typescript
import { CameraView } from 'expo-camera';

// Barcode scanning is built into CameraView - no separate barcode scanner needed
<CameraView
  onBarcodeScanned={handleQRCodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr', 'pdf417'],
  }}
/>
```

### Content Discovery RAG
**Interest-Based Discovery:**
- "Find people posting about similar activities nearby"
- "What's happening at the main stage right now?"
- "Who else completed the scavenger hunt challenge?"
- RAG across shared content for topic/location matching

**Privacy-Safe Matching:**
- Match interests without exposing personal data
- Aggregate activity patterns for recommendations
- Suggest connections based on quest overlap
- "People you might want to meet" based on shared activities

### AI Content Curation
**Smart Notifications:**
- "Someone near you just posted about the same artist"
- "Quest opportunity: Photo challenge 50 feet away"
- "Connection suggestion: User also trying the food challenge"

---

## Organizer/Supervisor Permissions Framework

### What Organizers CAN See:
**Aggregate Analytics (Privacy-Safe):**
- Popular locations and activity heatmaps (anonymized)
- Quest completion statistics and engagement metrics
- Content moderation flags and inappropriate content reports
- Real-time attendee activity patterns (no individual tracking)
- Overall event engagement and satisfaction scores

**Content Moderation:**
- Flagged content requiring review
- User reports of inappropriate behavior
- Spam detection and bulk content management
- Community guidelines enforcement tools

### What Organizers CANNOT See:
**Individual Privacy Protection:**
- Personal content without explicit consent or moderation flags
- Private conversations between attendees
- Specific user behavior tracking or surveillance
- Personal data beyond what's needed for event management
- Individual user content before moderation reports

**Clear Boundaries:**
- No individual user monitoring capabilities
- No access to private messages or personal data
- Content only visible after community reporting
- Transparent privacy policy explaining data access

---

## Implementation Roadmap - Phase 2

### Phase 2A: Event Foundation (Week 1-2)
**Sprint Goals**: Basic event creation and joining integrated into existing tabs

1. **Database Extensions**
   - Deploy new event-related tables with simplified privacy controls
   - Extend existing tables with event_id columns
   - Set up new RLS policies for event-scoped data
   - Implement geofencing tables (moderate accuracy)

2. **Event Discovery & Joining**
   - Enhance Search tab with event discovery section
   - Event code/QR joining modal system
   - Basic event browsing integration
   - Enhanced profile editing for pseudonymous handles

3. **Enhanced Feed Architecture**
   - Add event content section to Home tab
   - Following vs Discovery feed toggle
   - Event-specific content filtering
   - Story views state management foundation

### Phase 2B: AI-Powered Gamification (Week 3-4)
**Sprint Goals**: Quest system with AI verification and content quality systems

1. **AI-Powered Quest System**
   - Pinecone/Supabase pgvector setup for embeddings
   - OpenAI CLIP integration for image/video analysis
   - GPT-4V quest verification pipeline
   - Location-based verification with moderate geofencing accuracy
   - Probabilistic scoring with appeals process
   - Quest progress UI integrated in Home tab

2. **Content Quality Incentive System**
   - Daily content limits implementation (flat limits for all users)
   - Content limit UI and notifications
   - Simple spam prevention without complex scoring

3. **Interactive Map & Leaderboards**
   - Venue map modal with quest markers
   - AI-verified quest completion tracking
   - Real-time leaderboard accessible from Activity tab
   - Achievement system with AI-verified unlocks

### Phase 2C: Organizer Tools (Week 5-6)
**Sprint Goals**: B2B dashboard and management

1. **Organizer Dashboard**
   - Event analytics and metrics
   - Real-time participant monitoring
   - Content moderation tools

2. **Quest Builder**
   - Drag-and-drop quest creation
   - Location setting with map interface
   - Sponsor integration options

3. **Business Model Integration**
   - Pricing and billing system
   - Event package configuration
   - White-label branding options

### Phase 2D: Privacy Controls & Post-Event Experience (Week 7-8)
**Sprint Goals**: Privacy settings and memory preservation

1. **Simplified Privacy Controls**
   - Geofenced content visibility (moderate GPS accuracy)
   - Audience scope controls (all participants, connections, activity-based)
   - Ephemeral content with event-based expiration
   - Privacy settings integration in Profile tab
   - User-controlled privacy preferences

2. **Post-Event Experience & Memory Preservation**
   - AI-curated highlight reel generation using CLIP embeddings
   - Connection persistence and real contact exchange
   - Personal data export before content deletion
   - "Keep in touch" feature with context preservation
   - Collaborative event highlight creation

3. **Production Readiness & Organizer Privacy Framework**
   - Transparent organizer permission boundaries
   - Aggregate analytics without individual tracking
   - Content moderation tools with privacy protection
   - Load testing with simplified privacy controls
   - Beta testing with real event scenarios

---

## Business Model & Go-to-Market

### Revenue Streams
1. **Event Licensing**: $500-5000 per event (based on attendee count)
2. **White-label Customization**: $1000-10000 for branded versions
3. **Premium Features**: Advanced analytics, custom integrations
4. **Sponsor Integration**: Revenue share on sponsor quest placements

### Transparent Pricing Model
**Base Event License:** Fixed fee based on attendee capacity
**Variable Costs:** AI processing, storage, bandwidth at transparent rates
- **Cost Structure**: Variable costs charged at cost + 10% markup
- **Maximum Protection**: Never exceed 2x base license fee
- **Real-time Calculator**: Organizers see projected costs upfront
- **Monthly Reports**: Detailed usage breakdown and cost analysis
- **No Surprise Bills**: Clear caps and cost forecasting

### Pricing Tiers
- **Small Events** (50-200 people): $500 base + variables (max $1000)
- **Medium Events** (200-1000 people): $1500 base + variables (max $3000)
- **Large Events** (1000+ people): $5000 base + variables (max $10000)
- **Enterprise/Multi-event**: Custom pricing with volume discounts

**Example Variable Costs:**
- AI quest verification: $0.10 per submission
- RAG content discovery: $0.05 per query
- Video storage: $0.03 per GB per day
- Real-time features: $0.01 per active user per hour

### Target Customer Acquisition
1. **Local Event Organizers**: Music venues, college events, corporate retreats
2. **Event Operators**: Music events, food events, art shows
3. **Conference Organizers**: Tech conferences, trade shows
4. **Educational Institutions**: Orientation events, campus activities

---

## Success Metrics - Phase 2

### B2B Metrics (Organizers)
- Event organizer acquisition rate
- Average revenue per event
- Organizer retention (repeat events)
- Time to event setup (target: <2 hours)
- Customer satisfaction scores

### B2C Metrics (Attendees)  
- Event join rate from invites/codes
- Average quests completed per participant (target: >5 per event)
- Session duration during events (target: >30 min per day)
- **Event engagement rate**: Posts/stories created per participant within event
- **Social connections**: Follows/interactions made within event
- **Quest completion rate**: Percentage of available quests completed
- **Content quality**: Engagement on user-generated content within event
- **Privacy adoption**: Usage of pseudonymous profiles and privacy controls
- **Connection persistence**: Rate of real contact exchange before content expires
- **Data export usage**: Pre-deletion export requests
- **Return participation**: Users joining multiple events over time

### Technical Metrics
- App performance during peak event times
- Quest completion success rate
- Map/location accuracy
- Privacy feature adoption
- Export request completion rate

---

## Risk Mitigation & Contingencies

### Technical Risks
- **Poor connectivity at venues**: Offline-first quest caching, graceful degradation  
- **GPS accuracy variance**: Moderate accuracy tolerance (±100m) handles most scenarios
- **Scale challenges**: Load testing, CDN optimization

### Business Risks  
- **Slow organizer adoption**: Free pilot programs, case studies
- **Privacy concerns**: Transparent policies, user education
- **Competition**: Focus on unique privacy-first positioning

### Privacy & Legal Risks
- **Data handling**: GDPR compliance, clear deletion policies
- **Screenshot detection limitations**: User education, terms of service
- **Content moderation**: AI + human moderation hybrid

---

## Phase 3 & Future Roadmap

### Advanced Features (Phase 3+)
- **AI-powered quest recommendations**
- **AR/VR quest experiences**  
- **Mesh networking for offline social features**
- **Advanced sponsor integration marketplace**
- **Multi-event user profiles and achievement persistence**
- **White-label mobile app generation**

### Platform Evolution
- **Event organizer marketplace**
- **Quest template library and sharing**
- **Integration with ticketing platforms**
- **Corporate team-building packages**
- **Educational institution partnerships**

---

## Summary: The Spiky POV Advantage

This Phase 2 PRD transforms SnapConnect from a generic social app into a specialized **"Temporary High-Trust Social Network Operating System"** that event organizers can deploy to create unforgettable, privacy-respecting experiences for their attendees.

### Unique Differentiators (Spiky POVs):

1. **High-Trust Environment Broadcasting**: Unlike general social platforms where proximity sharing is scary, event environments create natural safety boundaries that enable more open, authentic sharing.

2. **Level Playing Field Philosophy**: Everyone starts with 0 followers at each event, encouraging authentic self-expression detached from external social proof or past accomplishments.

3. **Reverse Chronological Default**: Fights the "popularity spiral" by showing newest content first, giving everyone equal visibility opportunity regardless of early adoption.

4. **Quality Over Quantity Incentives**: Flat daily content limits prevent spam while ensuring equal posting opportunities for all participants.

5. **AI-Verified Gamification**: Probabilistic quest verification with acceptable false positives adds game-like unpredictability while enabling sophisticated challenges.

6. **Contextual Privacy Controls**: Granular broadcasting settings (geofenced, activity-based, connection-level) that match the situational nature of event networking.

7. **Memory Preservation Before Deletion**: AI-curated highlight reels and connection export features preserve meaningful memories while maintaining ephemeral core experience.

### Business Model Advantages:
- **Transparent pricing** with cost caps builds organizer trust
- **B2B focus** avoids social media platform scaling challenges
- **Privacy-first positioning** differentiates from surveillance-based competitors
- **AI moat** through sophisticated quest verification and content discovery

**This is not just another social app - it's an ephemeral, privacy-first, gamified social operating system specifically designed for temporary communities in high-trust environments.**

**Ready for AI-driven development with specific, actionable tasks that build incrementally on the existing MVP foundation while implementing genuinely differentiated features that competitors can't easily replicate.**
```

This Phase 2 PRD is designed to be **immediately actionable** for AI-driven development in Cursor. Each section includes:

✅ **Specific file paths** for new components
✅ **Database schema extensions** that build on existing structure  
✅ **Clear user stories** and feature specifications
✅ **Incremental development sprints** with concrete goals
✅ **Technical architecture** that leverages your existing work
✅ **Business model clarity** for B2B event organizers

**Want me to dive deeper into any specific section or create the first development tasks to get started?** 🚀