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

#### Extended Screen Hierarchy
```
App
├── (auth) [existing]
└── (protected)
    ├── (tabs) [existing normal mode]
    ├── (event-mode)
    │   ├── event-feed.tsx        // Event-specific content feed
    │   ├── quests/
    │   │   ├── index.tsx         // Quest list and progress
    │   │   ├── quest-detail.tsx  // Individual quest
    │   │   └── quest-camera.tsx  // Photo/video capture for quests
    │   ├── event-map.tsx         // Interactive venue map
    │   ├── leaderboard.tsx       // Rankings and achievements
    │   └── event-profile.tsx     // Event-specific profile
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
- `components/quests/QuestCard.tsx`
- `components/quests/QuestProgress.tsx`
- `components/quests/LocationTracker.tsx`

**Quest Types:**
- **Location-based**: Check-in at specific venue locations
- **Photo challenges**: Capture specific scenes/objects
- **Social quests**: Meet other attendees, group photos
- **Scavenger hunts**: Find hidden QR codes/objects
- **Sponsor integration**: Visit sponsor booths, try products

**Key Features:**
- Real-time location verification
- Photo/video submission and verification
- Progress tracking and point systems
- Unlockable quest chains
- Time-limited challenges

### 3. Event-Specific Social Features
**Files to Create:**
- `app/(protected)/(event-mode)/event-feed.tsx`
- `components/events/EventPostCard.tsx`
- `components/events/EphemeralContent.tsx`
- `components/events/EventStoriesBar.tsx`

**Enhanced Social Features:**
- Event-scoped content (only visible to event participants)
- Ephemeral posts with custom expiration
- Anonymous usernames with temporary identities
- Location-tagged content within venue
- Screenshot/screen recording warnings

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

## Implementation Roadmap - Phase 2

### Phase 2A: Event Foundation (Week 1-2)
**Sprint Goals**: Basic event creation and joining

1. **Database Extensions**
   - Deploy new event-related tables
   - Extend existing tables with event_id columns
   - Set up new RLS policies for event-scoped data

2. **Event Discovery & Joining**
   - Event code/QR joining system
   - Basic event browsing
   - Anonymous identity creation
   - Event mode navigation toggle

3. **Core Event Features**
   - Event-scoped posting
   - Basic quest system
   - Event participant management

### Phase 2B: Gamification Core (Week 3-4)
**Sprint Goals**: Quest system and gamification

1. **Quest System Implementation**
   - Location-based quest verification
   - Photo/video quest submissions
   - Point tracking and rewards
   - Quest progress UI

2. **Interactive Map**
   - Venue map integration
   - Quest location markers
   - Basic offline caching

3. **Leaderboard & Achievement System**
   - Real-time point calculations
   - Achievement badge system
   - Leaderboard rankings

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

### Phase 2D: Privacy & Polish (Week 7-8)
**Sprint Goals**: Privacy features and production readiness

1. **Enhanced Privacy Features**
   - Sophisticated ephemeral content system
   - Data export functionality
   - Screenshot detection and warnings

2. **Performance & Offline Capabilities**
   - Offline quest caching
   - Improved map performance
   - Battery optimization

3. **Launch Preparation**
   - Security audit
   - Load testing
   - Beta testing with small events

---

## Business Model & Go-to-Market

### Revenue Streams
1. **Event Licensing**: $500-5000 per event (based on attendee count)
2. **White-label Customization**: $1000-10000 for branded versions
3. **Premium Features**: Advanced analytics, custom integrations
4. **Sponsor Integration**: Revenue share on sponsor quest placements

### Pricing Tiers
- **Small Events** (50-200 people): $500
- **Medium Events** (200-1000 people): $1500  
- **Large Festivals** (1000+ people): $5000+
- **Enterprise/Multi-event**: Custom pricing

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
- Average quests completed per participant
- Session duration during events
- Content creation rate (posts/stories)
- Data export usage patterns

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

This Phase 2 PRD transforms SnapConnect from a generic social app into a specialized festival social operating system that event organizers can deploy to create unforgettable, privacy-respecting experiences for their attendees. The B2B model provides clear revenue streams while the privacy-first approach differentiates us in a crowded market.

**Ready for AI-driven development with specific, actionable tasks that build incrementally on the existing MVP foundation.**
```

This Phase 2 PRD is designed to be **immediately actionable** for AI-driven development in Cursor. Each section includes:

✅ **Specific file paths** for new components
✅ **Database schema extensions** that build on existing structure  
✅ **Clear user stories** and feature specifications
✅ **Incremental development sprints** with concrete goals
✅ **Technical architecture** that leverages your existing work
✅ **Business model clarity** for B2B festival organizers

**Want me to dive deeper into any specific section or create the first development tasks to get started?** 🚀