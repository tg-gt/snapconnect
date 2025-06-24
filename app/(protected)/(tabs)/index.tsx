import React, { useState, useEffect, useCallback } from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostList } from "@/components/feed/PostList";
import { CommentModal } from "@/components/social/CommentModal";
import { getFeed, likePost, unlikePost } from "@/lib/api";
import { Post } from "@/lib/types";

export default function HomeScreen() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState<string | undefined>();
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [commentModalVisible, setCommentModalVisible] = useState(false);

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

	const handleRefresh = useCallback(() => {
		setNextCursor(undefined);
		loadFeed(true);
	}, [loadFeed]);

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

	useEffect(() => {
		loadFeed(true);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="px-4 py-3 border-b border-border">
					<Text className="text-2xl font-bold">SnapConnect</Text>
				</View>

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
			</View>
		</SafeAreaView>
	);
}
