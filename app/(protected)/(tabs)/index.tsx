import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, Modal } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostList } from "@/components/feed/PostList";
import { CommentModal } from "@/components/social/CommentModal";
import { PostMenuModal } from "@/components/social/PostMenuModal";
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
	const [menuModalVisible, setMenuModalVisible] = useState(false);
	const [selectedMenuPost, setSelectedMenuPost] = useState<Post | null>(null);
	const [selectedStory, setSelectedStory] = useState<Story | null>(null);
	const [storyViewerVisible, setStoryViewerVisible] = useState(false);

	// Calculate story-related variables
	const selectedUserStories = selectedStory
		? stories.filter(s => s.user_id === selectedStory.user_id)
		: [];
	const initialStoryIndex = selectedStory
		? selectedUserStories.findIndex(s => s.id === selectedStory.id)
		: 0;

	const loadFeed = async (cursor?: string) => {
		try {
			setLoading(true);
			const data = await getFeed(cursor);
			
			if (cursor) {
				setPosts(prev => [...prev, ...data.posts]);
			} else {
				setPosts(data.posts);
			}
			
			setHasMore(data.has_more);
			setNextCursor(data.next_cursor);
		} catch (error) {
			console.error("Error loading feed:", error);
			Alert.alert("Error", "Failed to load feed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		loadFeed();
		loadStories();
		loadCurrentUser();
	}, []);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadFeed();
		await loadStories();
		setRefreshing(false);
	}, []);

	const handleLoadMore = useCallback(() => {
		if (!loading && hasMore && nextCursor) {
			loadFeed(nextCursor);
		}
	}, [loading, hasMore, nextCursor]);

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

	const handleMenuShare = useCallback((postId: string) => {
		handleShare(postId);
	}, [handleShare]);

	const handleMenuReport = useCallback((postId: string) => {
		// TODO: Implement report functionality
		console.log("Report post:", postId);
		Alert.alert("Post Reported", "Thank you for your report. We'll review this post.");
	}, []);

	const handleMenuDelete = useCallback((postId: string) => {
		// TODO: Implement delete functionality
		console.log("Delete post:", postId);
		// Remove from local state for now
		setPosts(prev => prev.filter(p => p.id !== postId));
		Alert.alert("Post Deleted", "Your post has been deleted.");
	}, []);

	const handleMenuEdit = useCallback((postId: string) => {
		// TODO: Implement edit functionality
		console.log("Edit post:", postId);
		Alert.alert("Edit Post", "Edit functionality coming soon!");
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
					onShare={handleMenuShare}
					onReport={handleMenuReport}
					onDelete={handleMenuDelete}
					onEdit={handleMenuEdit}
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
