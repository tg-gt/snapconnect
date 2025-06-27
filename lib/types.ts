// Database types for SnapConnect Instagram MVP

export interface User {
	id: string;
	email: string;
	username: string;
	full_name?: string;
	bio?: string;
	avatar_url?: string;
	website?: string;
	is_private: boolean;
	posts_count: number;
	followers_count: number;
	following_count: number;
	created_at: string;
	updated_at: string;
}

export interface Post {
	id: string;
	user_id: string;
	caption?: string;
	location?: string;
	likes_count: number;
	comments_count: number;
	created_at: string;
	updated_at: string;
	// Relations that will be joined
	user?: User;
	media?: PostMedia[];
	is_liked?: boolean;
}

export interface PostMedia {
	id: string;
	post_id: string;
	media_url: string;
	media_type: "photo" | "video";
	order_index: number;
	created_at: string;
}

export interface Like {
	id: string;
	user_id: string;
	post_id: string;
	created_at: string;
	user?: User;
}

export interface Comment {
	id: string;
	user_id: string;
	post_id: string;
	content: string;
	likes_count: number;
	created_at: string;
	user?: User;
	is_liked?: boolean;
}

export interface CommentLike {
	user_id: string;
	comment_id: string;
	created_at: string;
}

export interface Follow {
	id: string;
	follower_id: string;
	following_id: string;
	status: "approved" | "pending";
	created_at: string;
	follower?: User;
	following?: User;
}

export interface Hashtag {
	id: string;
	name: string;
	posts_count: number;
	created_at: string;
}

export interface PostHashtag {
	post_id: string;
	hashtag_id: string;
}

export interface Story {
	id: string;
	user_id: string;
	media_url: string;
	media_type: "photo" | "video";
	caption?: string;
	expires_at: string;
	created_at: string;
	user?: User;
	views_count?: number;
	has_viewed?: boolean;
}

export interface StoryView {
	id: string;
	story_id: string;
	viewer_id: string;
	viewed_at: string;
	viewer?: User;
}

export interface Message {
	id: string;
	sender_id: string;
	recipient_id: string;
	content?: string;
	message_type: "text" | "post_share" | "media";
	post_id?: string;
	media_url?: string;
	is_read: boolean;
	read_at?: string;
	created_at: string;
	sender?: User;
	recipient?: User;
	post?: Post;
}

export interface Activity {
	id: string;
	user_id: string;
	actor_id: string;
	activity_type: "like" | "comment" | "follow" | "mention";
	post_id?: string;
	comment_id?: string;
	is_read: boolean;
	created_at: string;
	actor?: User;
	post?: Post;
	comment?: Comment;
}

// API Response types
export interface FeedResponse {
	posts: Post[];
	next_cursor?: string;
	has_more: boolean;
}

export interface UserProfile extends User {
	posts: Post[];
	is_following?: boolean;
	is_followed_by?: boolean;
}

// Form types
export interface CreatePostData {
	caption?: string;
	location?: string;
	media: {
		uri: string;
		type: "photo" | "video";
	}[];
}

export interface UpdateProfileData {
	username?: string;
	full_name?: string;
	bio?: string;
	website?: string;
	is_private?: boolean;
}

// Phase 2: Event Context (hardcoded for PoC)
export const DEMO_EVENT_CONTEXT = {
	eventId: '550e8400-e29b-41d4-a716-446655440000',
	eventName: 'SnapConnect Demo Event',
	participantId: 'demo-participant-123', 
	eventStartDate: '2024-12-01',
	eventEndDate: '2024-12-02'
} as const;

// Feed Types for Dual Feed System
export type FeedType = 'following' | 'discovery';

export interface FeedToggleProps {
	activeTab: FeedType;
	onTabChange: (tab: FeedType) => void;
}

// Quest System Types (Phase 2)
export interface Quest {
	id: string;
	event_id: string;
	title: string;
	description: string;
	quest_type: 'location' | 'photo' | 'social' | 'scavenger' | 'sponsor';
	points_reward: number;
	location_latitude?: number;
	location_longitude?: number;
	location_radius_meters: number;
	required_photo: boolean;
	unlock_condition?: string; // JSON for complex unlock logic
	time_limit_minutes?: number;
	max_completions?: number; // null = unlimited
	is_active: boolean;
	order_index: number;
	created_at: string;
}

export interface QuestCompletion {
	id: string;
	quest_id: string;
	participant_id: string;
	completion_data?: any; // Photos, text responses, etc.
	points_earned: number;
	completed_at: string;
	verified: boolean;
	verified_by?: string;
}

export interface EventParticipant {
	id: string;
	event_id: string;
	user_id: string;
	display_name?: string;
	joined_at: string;
	total_points: number;
	quests_completed: number;
	is_active: boolean;
	role: 'participant' | 'moderator' | 'organizer';
}

// Quest Progress Tracking
export interface QuestProgress {
	quest: Quest;
	completion?: QuestCompletion;
	distance_to_location?: number; // in meters
	is_in_range: boolean;
	can_complete: boolean;
	progress_percentage: number;
}

// Location types
export interface LocationData {
	latitude: number;
	longitude: number;
	accuracy?: number;
	timestamp?: number;
}
