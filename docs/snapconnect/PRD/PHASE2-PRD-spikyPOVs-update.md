**Perfect!** Those decisions give us a rock-solid foundation. You've essentially defined a **"Festival Operating System"** that organizers can deploy for their events. This is genuinely compelling - let me create the Phase 2 PRD now.
Read file: docs/snapconnect/PRD/MVP-PRD.md

Perfect! Now I'll create the Phase 2 PRD that builds on your existing MVP foundation and transforms it into the festival social platform we discussed.

```markdown
# Product Requirements Document: SnapConnect Phase 2
## Festival Social Operating System with Privacy-First Gamification

### Executive Summary
Transform the existing SnapConnect Instagram MVP into a dual-purpose platform that serves both traditional social networking AND festival/event experiences. Phase 2 introduces "Event Mode" - a privacy-first, gamified social layer that event organizers can deploy to enhance attendee engagement through quests, ephemeral content, and community building.

### Strategic Pivot & Market Opportunity
**Phase 1**: Instagram clone for college students (B2C social sharing)
**Phase 2**: Festival social platform for event organizers (B2B engagement tools)

**Market Gap Identified**: No platform combines privacy-first design + social features + gamification specifically for events. Competitors like ConfyChat (messaging only), Mozi (friend tracking), and GooseChase (generic scavenger hunts) each solve pieces but miss the complete experience.

**Core Thesis - "Temporary, High-Trust Social Networks":**
- General public proximity-based social features are scary (safety concerns)
- Event environments create natural high-trust boundaries with barrier to entry
- Attendees can broadcast location, activities, beliefs more freely within event context
- "Level playing field" - everyone starts with 0 followers, encourages authentic, in-the-moment expression
- Ephemeral content removes "permanent consequences" anxiety

**Revenue Model**: B2B SaaS - Festival organizers pay $500-5000 per event for white-label social experience included in ticket price.

---

## Core User Stories - Phase 2

### Event Organizers (Primary Customer)
- **As an organizer**, I want to deploy a custom social app for my festival that increases attendee engagement and retention
- **As an organizer**, I want to create location-based quests and challenges that guide attendees through the venue
- **As an organizer**, I want real-time analytics on attendee behavior and popular activities
- **As an organizer**, I want to control content expiration (immediate to 1 week post-event)
- **As an organizer**, I want to integrate sponsors into quests and rewards naturally
- **As an organizer**, I want to moderate content and manage inappropriate behavior

### Festival Attendees (End Users)  
- **As an attendee**, I want to join my festival's private social network with a simple code
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
  "expo-location": "~17.1.3",
  "expo-barcode-scanner": "~14.1.3", 
  "expo-sensors": "~14.1.4",
  "expo-file-system": "~18.1.4",
  "expo-sharing": "~13.1.4",
  "expo-haptics": "~14.1.4",
  "react-native-qrcode-svg": "^6.3.11",
  "@react-native-async-storage/async-storage": "^2.1.2" // already exists
}
```

### Extended Database Schema

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
ALTER TABLE posts ADD COLUMN event_id UUID REFERENCES events(id);
ALTER TABLE posts ADD COLUMN quest_id UUID REFERENCES quests(id);
ALTER TABLE posts ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN allow_screenshot BOOLEAN DEFAULT TRUE;

-- Event-specific stories (extends existing stories table)  
ALTER TABLE stories ADD COLUMN event_id UUID REFERENCES events(id);

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

-- Screenshot/recording warnings
CREATE TABLE privacy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  violation_type VARCHAR(30) NOT NULL, -- screenshot, screen_recording
  detected_at TIMESTAMP DEFAULT NOW(),
  warned BOOLEAN DEFAULT FALSE
);
```

### Navigation Architecture - Extended

#### Dual-Mode App Structure
```
NORMAL MODE:          EVENT MODE:
Home | Search         Event Feed | Quests | Map | Leaderboard | Profile
Create | Activity |   
Profile              
```

**New Event Mode Navigation (5-tab):**
1. **Event Feed** - Event-specific posts and stories
2. **Quests** - Available challenges and progress  
3. **Map** - Interactive venue map with quest locations
4. **Leaderboard** - Points rankings and achievements
5. **Profile** - Event-specific profile and settings

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
- Content only visible within event boundaries (GPS + geofence validation)
- Automatic content hiding when users leave event area
- Option to extend visibility to "nearby" (within 1 mile of event)

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

#### Extended Screen Hierarchy
```
App
├── (auth) [existing]
└── (protected)
    ├── (tabs) [existing normal mode]
    ├── (event-mode)
    │   ├── event-feed.tsx        // Event-specific content feed with dual-feed tabs
    │   ├── quests/
    │   │   ├── index.tsx         // Quest list and progress
    │   │   ├── quest-detail.tsx  // Individual quest
    │   │   ├── quest-camera.tsx  // Photo/video capture for quests
    │   │   └── ai-verification.tsx // AI quest verification results
    │   ├── event-map.tsx         // Interactive venue map
    │   ├── leaderboard.tsx       // Rankings and achievements
    │   ├── event-profile.tsx     // Event-specific profile
    │   ├── content-limits.tsx    // Daily content limits and quality scoring
    │   └── privacy-controls.tsx  // Granular privacy settings
    ├── event-join.tsx            // Join event with code
    ├── event-discovery.tsx       // Browse available events
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

### 1. Event Discovery & Joining
**Files to Create:**
- `app/(protected)/event-discovery.tsx`
- `app/(protected)/event-join.tsx`
- `components/events/EventCard.tsx`
- `components/events/JoinEventModal.tsx`

**Key Features:**
- Browse nearby/featured events
- Join with event code or QR scan
- Event preview with details
- Capacity and timing restrictions

**User Flow:**
1. User discovers event via code/QR/browse
2. Views event details and privacy settings
3. Creates anonymous event identity
4. Joins event-specific social network

### 2. Quest System
**Files to Create:**
- `app/(protected)/(event-mode)/quests/index.tsx`
- `app/(protected)/(event-mode)/quests/quest-detail.tsx`
- `app/(protected)/(event-mode)/quests/quest-camera.tsx`
- `app/(protected)/(event-mode)/quests/ai-verification.tsx`
- `components/quests/QuestCard.tsx`
- `components/quests/QuestProgress.tsx`
- `components/quests/LocationTracker.tsx`
- `components/quests/AIVerificationStatus.tsx`
- `components/quests/VerificationAppeal.tsx`

**Quest Types:**
- **Location-based**: Check-in at specific venue locations with GPS + geofence validation
- **Photo challenges**: AI-verified capture of specific scenes/objects
- **Social quests**: Meet other attendees, group photos with face detection
- **Scavenger hunts**: Find hidden QR codes/objects with computer vision
- **Sponsor integration**: Visit sponsor booths, try products with AI verification

**Key Features:**
- **AI-Powered Verification**: RAG analysis of submitted photos/videos
- **Probabilistic Scoring**: 80%+ confidence threshold with acceptable false positives
- **Real-time location verification**: GPS + venue geofencing
- **Appeals Process**: Human review for disputed AI decisions
- **Progress tracking**: Point systems with engagement-based bonuses
- **Unlockable quest chains**: Complex unlock conditions and dependencies
- **Time-limited challenges**: Urgency and scarcity mechanics

### 3. Event-Specific Social Features
**Files to Create:**
- `app/(protected)/(event-mode)/event-feed.tsx`
- `app/(protected)/(event-mode)/content-limits.tsx`
- `app/(protected)/(event-mode)/privacy-controls.tsx`
- `components/events/EventPostCard.tsx`
- `components/events/EphemeralContent.tsx`
- `components/events/EventStoriesBar.tsx`
- `components/events/DualFeedTabs.tsx`
- `components/events/QualityScoreDisplay.tsx`
- `components/privacy/ContextualControls.tsx`

**Enhanced Social Features:**
- **Dual-Feed Architecture**: Following (reverse chronological) + Discovery (algorithmic)
- **Event-scoped content**: Only visible to event participants with granular privacy controls
- **Ephemeral posts**: Custom expiration (event end vs user-defined)
- **Anonymous identities**: Temporary usernames detached from real identity
- **Geofenced content**: Automatically hide content when users leave event area
- **Quality incentives**: Daily content limits with engagement-based unlocks
- **AI-powered discovery**: RAG-based content and people recommendations
- **Screenshot warnings**: Privacy violation detection and user education

### 4. Interactive Event Map
**Files to Create:**
- `app/(protected)/(event-mode)/event-map.tsx`
- `components/map/VenueMap.tsx`
- `components/map/QuestMarkers.tsx`
- `components/map/AttendeeHeatmap.tsx`

**Key Features:**
- Interactive venue layout
- Quest location markers
- Real-time attendee density (privacy-safe)
- Points of interest and sponsor locations
- Offline map caching for poor connectivity

### 5. Gamification & Leaderboards
**Files to Create:**
- `app/(protected)/(event-mode)/leaderboard.tsx`
- `components/gamification/PointsDisplay.tsx`
- `components/gamification/AchievementBadges.tsx`
- `components/gamification/LeaderboardCard.tsx`

**Gamification Elements:**
- Point system for quest completion
- Achievement badges and unlockables
- Team-based challenges
- Real-time leaderboard updates
- Surprise bonus point opportunities

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

### 7. Privacy & Data Export
**Files to Create:**
- `app/(protected)/export/data-export.tsx`
- `app/(protected)/export/export-status.tsx`
- `components/privacy/ExportControls.tsx`
- `components/privacy/EphemeralWarning.tsx`
- `components/privacy/ScreenshotDetection.tsx`

**Privacy Features:**
- Selective data export (contacts, photos, achievements)
- Screenshot/screen recording detection and warnings
- Automatic content deletion timers
- Granular privacy controls
- GDPR-compliant data handling

---

## Content Quality Incentive System

### Daily Content Limits
Prevent spam and encourage intentional sharing:

**Base Daily Limits:**
- Video content: 2 hours total per day
- Photos: 20 photos per day  
- Stories: 10 stories per day
- Posts: 5 posts per day

**Quality Scoring Unlocks:**
- High engagement (likes/comments) unlocks additional posting privileges
- Quest completion increases daily limits by 20%
- Well-received content gets priority placement in Discovery feed
- "Quality Contributor" badge unlocks unlimited posting

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

### Quest Verification with RAG
**Computer Vision Quest Verification:**
- RAG analysis of submitted photos/videos for quest completion
- 80%+ confidence threshold for automatic verification
- Probabilistic verification adds "game-like randomness"
- Appeals process for disputed completions
- Some false positives acceptable (adds fun unpredictability)

**Example Quest Types:**
- "Take a photo with someone wearing a red hat" → Face detection + color analysis
- "Capture the main stage during a performance" → Scene recognition + audio analysis
- "Find the hidden QR code near the food trucks" → QR detection + location verification

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
**Sprint Goals**: Basic event creation and joining with spiky POV foundations

1. **Database Extensions**
   - Deploy new event-related tables including story_views, content_quality_scores
   - Extend existing tables with event_id columns
   - Set up new RLS policies for event-scoped data
   - Implement geofencing and privacy control tables

2. **Event Discovery & Joining**
   - Event code/QR joining system
   - Basic event browsing
   - Anonymous identity creation (temporary usernames)
   - Event mode navigation toggle
   - Geofenced visibility basic implementation

3. **Dual-Feed Architecture Foundation**
   - Following feed (reverse chronological)
   - Discovery feed (basic algorithmic ranking)
   - Feed switching UI components
   - Story views state management foundation

### Phase 2B: AI-Powered Gamification (Week 3-4)
**Sprint Goals**: Quest system with AI verification and content quality systems

1. **AI-Powered Quest System**
   - Computer vision quest verification (RAG implementation)
   - Location-based verification with geofencing
   - Probabilistic scoring with appeals process
   - Photo/video AI analysis pipeline
   - Quest progress UI with verification status

2. **Content Quality Incentive System**
   - Daily content limits implementation
   - Quality scoring algorithm
   - Engagement-based limit unlocks
   - "Quality Contributor" badge system
   - Content limit UI and notifications

3. **Interactive Map & Leaderboards**
   - Venue map integration with quest markers
   - AI-verified quest completion tracking
   - Real-time leaderboard with quality bonuses
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

### Phase 2D: Advanced Privacy & Post-Event Experience (Week 7-8)
**Sprint Goals**: Granular privacy controls and memory preservation

1. **Advanced Privacy & Contextual Controls**
   - Geofenced content visibility (GPS-based hiding)
   - Granular audience controls (all participants, connections, activity-based)
   - Sophisticated ephemeral content with custom expiration
   - Screenshot/screen recording detection and education
   - Privacy violation tracking and warnings

2. **Post-Event Experience & Memory Preservation**
   - AI-curated highlight reel generation
   - Connection persistence and real contact exchange
   - Personal data export before content deletion
   - "Keep in touch" feature with context preservation
   - Collaborative event highlight creation

3. **Production Readiness & Organizer Privacy Framework**
   - Transparent organizer permission boundaries
   - Aggregate analytics without individual tracking
   - Content moderation tools with privacy protection
   - Load testing with privacy controls
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
- **Large Festivals** (1000+ people): $5000 base + variables (max $10000)
- **Enterprise/Multi-event**: Custom pricing with volume discounts

**Example Variable Costs:**
- AI quest verification: $0.10 per submission
- RAG content discovery: $0.05 per query
- Video storage: $0.03 per GB per day
- Real-time features: $0.01 per active user per hour

### Target Customer Acquisition
1. **Local Event Organizers**: Music venues, college events, corporate retreats
2. **Festival Operators**: Music festivals, food festivals, art shows
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
- Event join rate from invites
- Average quests completed per participant (target: >5 per event)
- Session duration during events (target: >30 min per day)
- **Content creation rate**: Posts/stories per participant (measuring spam prevention success)
- **Quality score distribution**: Percentage of users unlocking additional posting privileges
- **Feed engagement**: Following vs Discovery feed usage patterns
- **Privacy adoption**: Usage of granular privacy controls
- **Connection persistence**: Rate of real contact exchange post-event
- **AI verification accuracy**: False positive/negative rates for quest verification
- Data export usage patterns before content deletion

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
- **GPS accuracy issues**: Manual check-in options, QR code backups
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

4. **Quality Over Quantity Incentives**: Daily content limits with engagement-based unlocks prevent spam while rewarding thoughtful content creation.

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
✅ **Business model clarity** for B2B festival organizers

**Want me to dive deeper into any specific section or create the first development tasks to get started?** 🚀