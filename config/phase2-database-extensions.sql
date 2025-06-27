-- Phase 2 Database Schema Extensions
-- Deploy this after Phase 1 schema is already deployed
-- Source: docs/snapconnect/PRD/PHASE2-PRD-spikyPOVs-update.md

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

-- Indexes for performance
CREATE INDEX idx_events_code ON events(event_code);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);
CREATE INDEX idx_quests_event ON quests(event_id);
CREATE INDEX idx_quest_completions_quest ON quest_completions(quest_id);
CREATE INDEX idx_quest_completions_participant ON quest_completions(participant_id);
CREATE INDEX idx_posts_event ON posts(event_id);
CREATE INDEX idx_stories_event ON stories(event_id);
CREATE INDEX idx_leaderboards_event ON leaderboards(event_id);

-- Insert demo event for development
INSERT INTO events (
  id,
  organizer_id,
  name,
  description,
  location_name,
  latitude,
  longitude,
  start_date,
  end_date,
  event_code,
  content_expires_at,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Valid UUID for demo event
  (SELECT id FROM users LIMIT 1), -- Use first user as organizer
  'SnapConnect Demo Event',
  'Demo event for Phase 2 development and testing',
  'Demo Venue',
  37.7749,  -- San Francisco coordinates
  -122.4194,
  '2024-12-01 09:00:00',
  '2024-12-02 23:59:59',
  'DEMO2024',
  '2024-12-09 23:59:59', -- Content expires 1 week after event
  true
) ON CONFLICT (id) DO NOTHING;

-- Create demo participant for current user (if any)
INSERT INTO event_participants (
  event_id,
  user_id,
  display_name,
  role
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  'Demo User',
  'participant'
FROM users 
LIMIT 1
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Add some demo quests
INSERT INTO quests (
  event_id,
  title,
  description,
  quest_type,
  points_reward,
  location_latitude,
  location_longitude,
  location_radius_meters,
  required_photo,
  is_active,
  order_index
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Check in at Main Stage',
  'Visit the main stage area and check in to earn points!',
  'location',
  10,
  37.7749,
  -122.4194,
  100,
  false,
  true,
  1
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Snap a Food Truck Photo',
  'Take a photo of any food truck at the event',
  'photo',
  15,
  37.7750,
  -122.4195,
  150,
  true,
  true,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Meet 3 New People',
  'Start conversations with 3 different attendees',
  'social',
  20,
  NULL,
  NULL,
  NULL,
  false,
  true,
  3
);

-- Enable RLS policies (basic security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined later)
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);
CREATE POLICY "Participants can view their events" ON event_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Quest are readable by event participants" ON quests FOR SELECT USING (
  event_id IN (
    SELECT event_id FROM event_participants WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can create quest completions" ON quest_completions FOR INSERT WITH CHECK (
  participant_id IN (
    SELECT id FROM event_participants WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can view their quest completions" ON quest_completions FOR SELECT USING (
  participant_id IN (
    SELECT id FROM event_participants WHERE user_id = auth.uid()
  )
);

COMMIT; 