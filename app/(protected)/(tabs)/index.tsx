import React, { useState, useEffect, useCallback } from "react";
import { View, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { PostList } from "@/components/feed/PostList";
import { getFeed, likePost, unlikePost } from "@/lib/api";
import { Post } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function HomeScreen() {
	const { colorScheme } = useColorScheme();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState<string | undefined>();

	const loadFeed = useCallback(async (refresh = false) => {
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
				setPosts(prev => [...prev, ...response.posts]);
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
	}, [nextCursor]);

	const handleRefresh = useCallback(() => {
		setNextCursor(undefined);
		loadFeed(true);
	}, [loadFeed]);

	const handleLoadMore = useCallback(() => {
		if (hasMore && !loading) {
			loadFeed(false);
		}
	}, [hasMore, loading, loadFeed]);

	const handleLike = useCallback(async (postId: string) => {
		try {
			// Optimistically update UI
			setPosts(prev => prev.map(post => 
				post.id === postId 
					? { 
						...post, 
						is_liked: !post.is_liked,
						likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
					}
					: post
			));

			// Get current like status
			const post = posts.find(p => p.id === postId);
			if (!post) return;

			if (post.is_liked) {
				await unlikePost(postId);
			} else {
				await likePost(postId);
			}
		} catch (error) {
			// Revert optimistic update on error
			setPosts(prev => prev.map(post => 
				post.id === postId 
					? { 
						...post, 
						is_liked: !post.is_liked,
						likes_count: post.is_liked ? post.likes_count + 1 : post.likes_count - 1
					}
					: post
			));
			console.error("Error toggling like:", error);
			Alert.alert("Error", "Failed to update like. Please try again.");
		}
	}, [posts]);

	const handleComment = useCallback((postId: string) => {
		// TODO: Navigate to comment screen
		console.log("Comment on post:", postId);
	}, []);

	const handleShare = useCallback((postId: string) => {
		// TODO: Implement share functionality
		console.log("Share post:", postId);
	}, []);

	const handleProfilePress = useCallback((userId: string) => {
		// TODO: Navigate to user profile
		console.log("View profile:", userId);
	}, []);

	useEffect(() => {
		loadFeed(true);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
				<Text className="text-2xl font-bold">SnapConnect</Text>
				<View className="flex-row space-x-4">
					<Ionicons 
						name="heart-outline" 
						size={24} 
						color={colorScheme === "dark" ? colors.dark.foreground : colors.light.foreground} 
					/>
					<Ionicons 
						name="paper-plane-outline" 
						size={24} 
						color={colorScheme === "dark" ? colors.dark.foreground : colors.light.foreground} 
					/>
				</View>
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
		</SafeAreaView>
	);
}
