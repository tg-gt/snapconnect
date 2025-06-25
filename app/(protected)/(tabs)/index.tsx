import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, Modal } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostList } from "@/components/feed/PostList";
import { CommentModal } from "@/components/social/CommentModal";
import { StoriesBar } from "@/components/stories/StoriesBar";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { getFeed, likePost, unlikePost, getStories, getCurrentUser } from "@/lib/api";
import { Post, Story, User } from "@/lib/types";

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
	const [selectedStory, setSelectedStory] = useState<Story | null>(null);
	const [storyViewerVisible, setStoryViewerVisible] = useState(false);

	const loadFeed = useCallback(
		async (refresh = false) => {
			try {
				if (refresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				const response = await getFeed(refresh ? undefined : nextCursor);

				if (refresh) {
					setPosts(response.posts);
				} else {
					setPosts((prev) => [...prev, ...response.posts]);
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
		[nextCursor],
	);

	const loadStories = useCallback(async () => {
		try {
			const storiesData = await getStories();
			setStories(storiesData);
		} catch (error) {
			console.error("Error loading stories:", error);
		}
	}, []);

	const loadCurrentUser = useCallback(async () => {
		try {
			const user = await getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			console.error("Error loading current user:", error);
		}
	}, []);

	const handleRefresh = useCallback(() => {
		setNextCursor(undefined);
		loadFeed(true);
		loadStories();
	}, [loadFeed, loadStories]);

	const handleLoadMore = useCallback(() => {
		if (hasMore && !loading) {
			loadFeed(false);
		}
	}, [hasMore, loading, loadFeed]);

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
		// Refresh stories to update view status
		loadStories();
	}, [loadStories]);

	const handleStoryUserProfile = useCallback((userId: string) => {
		setStoryViewerVisible(false);
		setSelectedStory(null);
		router.push(`/(protected)/user-profile?userId=${userId}`);
	}, []);

	useEffect(() => {
		loadFeed(true);
		loadStories();
		loadCurrentUser();
	}, []);

	// Get all stories for the selected user when viewing
	const selectedUserStories = selectedStory 
		? stories.filter(s => s.user_id === selectedStory.user_id)
		: [];
	const initialStoryIndex = selectedStory 
		? selectedUserStories.findIndex(s => s.id === selectedStory.id)
		: 0;

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="px-4 py-3 border-b border-border">
					<Text className="text-2xl font-bold">SnapConnect</Text>
				</View>

				{/* Stories Bar */}
				<StoriesBar
					stories={stories}
					currentUser={currentUser}
					onStoryPress={handleStoryPress}
					onCreateStory={handleCreateStory}
				/>

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
