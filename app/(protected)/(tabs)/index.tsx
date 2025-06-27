import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, Modal, TextInput } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostList } from "@/components/feed/PostList";
import { FeedToggle } from "@/components/feed/FeedToggle";
import { CommentModal } from "@/components/social/CommentModal";
import { PostMenuModal } from "@/components/social/PostMenuModal";
import { StoriesBar } from "@/components/stories/StoriesBar";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { getFeed, likePost, unlikePost, getStories, getCurrentUser, deletePost, updatePost } from "@/lib/api";
import { Post, Story, User, FeedType, DEMO_EVENT_CONTEXT, Quest, QuestProgress as QuestProgressType, LocationData } from "@/lib/types";
import { QuestCard } from "@/components/quests/QuestCard";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function HomeScreen() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [stories, setStories] = useState<Story[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState<string | undefined>();
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [commentModalVisible, setCommentModalVisible] = useState(false);
	const [menuModalVisible, setMenuModalVisible] = useState(false);
	const [selectedMenuPost, setSelectedMenuPost] = useState<Post | null>(null);
	const [selectedStory, setSelectedStory] = useState<Story | null>(null);
	const [storyViewerVisible, setStoryViewerVisible] = useState(false);
	
	// Edit modal state
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | null>(null);
	const [editCaption, setEditCaption] = useState("");
	const [editLocation, setEditLocation] = useState("");
	const [editLoading, setEditLoading] = useState(false);

	// Phase 2: Dual feed system state
	const [activeFeedType, setActiveFeedType] = useState<FeedType>('following');

	// Phase 2: Quest system state
	const [quests, setQuests] = useState<Quest[]>([]);
	const [questProgresses, setQuestProgresses] = useState<QuestProgressType[]>([]);

	const { colorScheme } = useColorScheme();

	// Calculate story-related variables
	const selectedUserStories = selectedStory
		? stories.filter(s => s.user_id === selectedStory.user_id)
		: [];
	const initialStoryIndex = selectedStory && selectedUserStories.length > 0
		? selectedUserStories.findIndex(s => s.id === selectedStory.id)
		: 0;

	const loadFeed = useCallback(
		async (refresh = false, feedType = activeFeedType, cursor?: string) => {
			try {
				if (refresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				const response = await getFeed(feedType, cursor || (refresh ? undefined : nextCursor), 10);
				
				if (cursor || !refresh) {
					setPosts(prev => refresh ? response.posts : [...prev, ...response.posts]);
				} else {
					setPosts(response.posts);
				}
				
				setHasMore(response.has_more);
				setNextCursor(response.next_cursor);
			} catch (error) {
				console.error("Error loading feed:", error);
				Alert.alert("Error", "Failed to load feed. Please try again.");
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[nextCursor, activeFeedType],
	);

	const loadStories = async () => {
		try {
			const storiesData = await getStories();
			setStories(storiesData);
		} catch (error) {
			console.error("Error loading stories:", error);
		}
	};

	const loadCurrentUser = async () => {
		try {
			const user = await getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			console.error("Error loading current user:", error);
		}
	};

	// Phase 2: Load demo quests
	const loadQuests = async () => {
		try {
			// Mock quest data - in real app, this would come from API
			const mockQuests: Quest[] = [
				{
					id: 'quest-1',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Find the Main Stage',
					description: 'Navigate to the main stage and take a photo of the setup',
					quest_type: 'location',
					points_reward: 50,
					location_latitude: 37.7749,
					location_longitude: -122.4194,
					location_radius_meters: 100,
					required_photo: true,
					is_active: true,
					order_index: 1,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-2',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Meet 3 New People',
					description: 'Start conversations with 3 new attendees and take a group photo',
					quest_type: 'social',
					points_reward: 75,
					location_radius_meters: 0,
					required_photo: true,
					is_active: true,
					order_index: 2,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-3',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Food Truck Adventure',
					description: 'Visit the food truck area and try something new',
					quest_type: 'location',
					points_reward: 30,
					location_latitude: 37.7751,
					location_longitude: -122.4180,
					location_radius_meters: 50,
					required_photo: false,
					is_active: true,
					order_index: 3,
					created_at: new Date().toISOString(),
				},
			];

			setQuests(mockQuests);

			// Initialize quest progress
			const mockProgresses: QuestProgressType[] = mockQuests.map(quest => ({
				quest,
				is_in_range: false,
				can_complete: false,
				progress_percentage: 10,
				distance_to_location: undefined,
			}));

			setQuestProgresses(mockProgresses);
		} catch (error) {
			console.error("Error loading quests:", error);
		}
	};

	useEffect(() => {
		loadFeed(true, activeFeedType);
		loadStories();
		loadCurrentUser();
		loadQuests();
	}, []);

	// Phase 2: Event context logging (for PoC)
	useEffect(() => {
		console.log('Demo Event Context:', DEMO_EVENT_CONTEXT);
	}, []);

	// Refresh stories when screen comes into focus (e.g., after creating a story)
	useFocusEffect(
		useCallback(() => {
			loadStories();
		}, [])
	);

	const handleRefresh = useCallback(() => {
		setNextCursor(undefined);
		loadFeed(true, activeFeedType);
		loadStories();
	}, [loadFeed, activeFeedType]);

	// Phase 2: Handle feed type change
	const handleFeedTypeChange = useCallback((feedType: FeedType) => {
		setActiveFeedType(feedType);
		setNextCursor(undefined);
		setPosts([]);
		loadFeed(true, feedType);
	}, [loadFeed]);

	const handleLoadMore = useCallback(() => {
		if (!loading && hasMore && nextCursor) {
			loadFeed(false, activeFeedType, nextCursor);
		}
	}, [loading, hasMore, nextCursor, activeFeedType, loadFeed]);

	const handleLike = useCallback(
		async (postId: string) => {
			try {
				// Optimistically update UI
				setPosts((prev) =>
					prev.map((post) =>
						post.id === postId
							? {
									...post,
									is_liked: !post.is_liked,
									likes_count: post.is_liked
										? post.likes_count - 1
										: post.likes_count + 1,
								}
							: post,
					),
				);

				// Get current like status
				const post = posts.find((p) => p.id === postId);
				if (!post) return;

				if (post.is_liked) {
					await unlikePost(postId);
				} else {
					await likePost(postId);
				}
			} catch (error) {
				// Revert optimistic update on error
				setPosts((prev) =>
					prev.map((post) =>
						post.id === postId
							? {
									...post,
									is_liked: !post.is_liked,
									likes_count: post.is_liked
										? post.likes_count + 1
										: post.likes_count - 1,
								}
							: post,
					),
				);
				console.error("Error toggling like:", error);
				Alert.alert("Error", "Failed to update like. Please try again.");
			}
		},
		[posts],
	);

	const handleComment = useCallback((postId: string) => {
		setSelectedPostId(postId);
		setCommentModalVisible(true);
	}, []);

	const handleCloseComments = useCallback(() => {
		setCommentModalVisible(false);
		setSelectedPostId(null);
	}, []);

	const handleShare = useCallback((postId: string) => {
		// TODO: Implement share functionality
		console.log("Share post:", postId);
	}, []);

	const handleProfilePress = useCallback((userId: string) => {
		router.push(`/(protected)/user-profile?userId=${userId}`);
	}, []);

	const handleMenu = useCallback((postId: string) => {
		const post = posts.find(p => p.id === postId);
		if (post) {
			setSelectedMenuPost(post);
			setMenuModalVisible(true);
		}
	}, [posts]);

	const handleCloseMenu = useCallback(() => {
		setMenuModalVisible(false);
		setSelectedMenuPost(null);
	}, []);

	const handleMenuReport = useCallback((postId: string) => {
		// TODO: Implement report functionality
		console.log("Report post:", postId);
		Alert.alert("Post Reported", "Thank you for your report. We'll review this post.");
	}, []);

	const handleMenuDelete = useCallback(async (postId: string) => {
		console.log("🗑️ Delete button clicked for post:", postId);
		try {
			console.log("🔄 Calling deletePost API...");
			await deletePost(postId);
			console.log("✅ Post deleted successfully from database");
			
			// Remove from local state
			setPosts(prev => {
				const newPosts = prev.filter(p => p.id !== postId);
				console.log("📱 Updated local state, posts count:", newPosts.length);
				return newPosts;
			});
			
			Alert.alert("Success", "Your post has been deleted.");
		} catch (error) {
			console.error("❌ Error deleting post:", error);
			console.error("Error details:", JSON.stringify(error, null, 2));
			const errorMessage = error instanceof Error ? error.message : String(error);
			Alert.alert("Error", `Failed to delete post: ${errorMessage}`);
		}
	}, []);

	const handleMenuEdit = useCallback((postId: string) => {
		const post = posts.find(p => p.id === postId);
		if (post) {
			setEditingPost(post);
			setEditCaption(post.caption || "");
			setEditLocation(post.location || "");
			setEditModalVisible(true);
		}
	}, [posts]);

	const handleSaveEdit = useCallback(async () => {
		if (!editingPost) return;

		try {
			setEditLoading(true);
			const updatedPost = await updatePost(editingPost.id, {
				caption: editCaption.trim() || undefined,
				location: editLocation.trim() || undefined,
			});

			// Update local state
			setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
			
			setEditModalVisible(false);
			setEditingPost(null);
			setEditCaption("");
			setEditLocation("");
			
			Alert.alert("Success", "Your post has been updated.");
		} catch (error) {
			console.error("Error updating post:", error);
			Alert.alert("Error", "Failed to update post. Please try again.");
		} finally {
			setEditLoading(false);
		}
	}, [editingPost, editCaption, editLocation]);

	const handleCancelEdit = useCallback(() => {
		setEditModalVisible(false);
		setEditingPost(null);
		setEditCaption("");
		setEditLocation("");
	}, []);

	const handleStoryPress = useCallback((story: Story) => {
		// Find all stories from the same user
		const userStories = stories.filter(s => s.user_id === story.user_id);
		const initialIndex = userStories.findIndex(s => s.id === story.id);
		
		setSelectedStory(story);
		setStoryViewerVisible(true);
	}, [stories]);

	const handleCreateStory = useCallback(() => {
		router.push("/(protected)/(tabs)/create");
	}, []);

	const handleCloseStoryViewer = useCallback(() => {
		setStoryViewerVisible(false);
		setSelectedStory(null);
	}, []);

	const handleStoryUserProfile = useCallback((userId: string) => {
		setStoryViewerVisible(false);
		router.push(`/(protected)/user-profile?userId=${userId}`);
	}, []);

	// Phase 2: Quest handlers
	const handleQuestPress = useCallback((questId: string) => {
		router.push({
			pathname: '/(protected)/quest-detail',
			params: { questId },
		});
	}, []);

	const handleQuestComplete = useCallback(async (questId: string) => {
		try {
			// Find the quest progress
			const questProgress = questProgresses.find(qp => qp.quest.id === questId);
			if (!questProgress?.can_complete) {
				Alert.alert('Cannot Complete', 'Quest requirements not met yet!');
				return;
			}

			// Navigate to quest detail for completion
			handleQuestPress(questId);
		} catch (error) {
			console.error('Error handling quest completion:', error);
		}
	}, [questProgresses, handleQuestPress]);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="px-4 py-3 border-b border-border">
					<Text className="text-2xl font-bold">{DEMO_EVENT_CONTEXT.eventName}</Text>
				</View>

				{/* Stories Bar */}
				<StoriesBar
					stories={stories}
					currentUser={currentUser}
					onStoryPress={handleStoryPress}
					onCreateStory={handleCreateStory}
				/>

				{/* Phase 2: Feed Toggle */}
				<FeedToggle
					activeTab={activeFeedType}
					onTabChange={handleFeedTypeChange}
				/>

				{/* Phase 2: Active Quests Section */}
				{questProgresses.length > 0 && (
					<View className="px-4 py-3 border-b border-border">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="text-lg font-semibold">Active Quests</Text>
							<TouchableOpacity>
								<Text className="text-blue-600 font-medium">View All</Text>
							</TouchableOpacity>
						</View>

						{/* Show first 2 active quests */}
						{questProgresses.slice(0, 2).map((questProgress) => (
							<QuestCard
								key={questProgress.quest.id}
								questProgress={questProgress}
								onPress={() => handleQuestPress(questProgress.quest.id)}
								onComplete={() => handleQuestComplete(questProgress.quest.id)}
								className="mb-3 last:mb-0"
							/>
						))}
					</View>
				)}

				{/* Feed */}
				<PostList
					posts={posts}
					loading={loading}
					refreshing={refreshing}
					hasMore={hasMore}
					onRefresh={handleRefresh}
					onLoadMore={handleLoadMore}
					onLike={handleLike}
					onComment={handleComment}
					onShare={handleShare}
					onProfilePress={handleProfilePress}
					onMenu={handleMenu}
				/>

				{/* Comment Modal */}
				<CommentModal
					visible={commentModalVisible}
					onClose={handleCloseComments}
					postId={selectedPostId || ""}
					onCommentAdded={() => {
						// Could refresh feed or update comment count
					}}
				/>

				{/* Post Menu Modal */}
				<PostMenuModal
					visible={menuModalVisible}
					onClose={handleCloseMenu}
					post={selectedMenuPost}
					isOwnPost={selectedMenuPost?.user_id === currentUser?.id}
					onReport={handleMenuReport}
					onDelete={handleMenuDelete}
					onEdit={handleMenuEdit}
				/>

				{/* Edit Post Modal */}
				<Modal
					visible={editModalVisible}
					animationType="slide"
					presentationStyle="pageSheet"
				>
					<View className={`flex-1 ${colorScheme === "dark" ? "bg-black" : "bg-white"}`}>
						{/* Header */}
						<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
							<TouchableOpacity onPress={handleCancelEdit}>
								<Text className="text-lg">Cancel</Text>
							</TouchableOpacity>
							<Text className="text-lg font-semibold">Edit Post</Text>
							<TouchableOpacity onPress={handleSaveEdit} disabled={editLoading}>
								<Text className={`text-lg font-semibold ${editLoading ? "text-muted-foreground" : "text-blue-500"}`}>
									{editLoading ? "Saving..." : "Save"}
								</Text>
							</TouchableOpacity>
						</View>

						<View className="flex-1 p-4">
							{/* Caption */}
							<View className="mb-6">
								<Text className="text-sm font-medium mb-2">Caption</Text>
								<TextInput
									value={editCaption}
									onChangeText={setEditCaption}
									placeholder="Write a caption..."
									placeholderTextColor={
										colorScheme === "dark"
											? colors.dark.mutedForeground
											: colors.light.mutedForeground
									}
									className={`p-3 rounded-lg border border-border min-h-[100px] ${
										colorScheme === "dark" ? "text-white" : "text-black"
									}`}
									multiline
									textAlignVertical="top"
								/>
							</View>

							{/* Location */}
							<View className="mb-6">
								<Text className="text-sm font-medium mb-2">Location</Text>
								<TextInput
									value={editLocation}
									onChangeText={setEditLocation}
									placeholder="Add location..."
									placeholderTextColor={
										colorScheme === "dark"
											? colors.dark.mutedForeground
											: colors.light.mutedForeground
									}
									className={`p-3 rounded-lg border border-border ${
										colorScheme === "dark" ? "text-white" : "text-black"
									}`}
								/>
							</View>
						</View>
					</View>
				</Modal>

				{/* Story Viewer Modal */}
				<Modal
					visible={storyViewerVisible}
					animationType="fade"
					presentationStyle="fullScreen"
				>
					{selectedStory && (
						<StoryViewer
							stories={selectedUserStories}
							initialIndex={Math.max(0, initialStoryIndex)}
							onClose={handleCloseStoryViewer}
							onUserProfile={handleStoryUserProfile}
						/>
					)}
				</Modal>
			</View>
		</SafeAreaView>
	);
}