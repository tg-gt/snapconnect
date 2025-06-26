import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostDetailModal } from "@/components/social/PostDetailModal";
import { CommentModal } from "@/components/social/CommentModal";
import { PostMenuModal } from "@/components/social/PostMenuModal";
import { getCurrentUser, getUserProfile, likePost, unlikePost, deletePost } from "@/lib/api";
import { User, Post } from "@/lib/types";

export default function ProfileScreen() {
	const [user, setUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [postDetailVisible, setPostDetailVisible] = useState(false);
	const [commentModalVisible, setCommentModalVisible] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [menuModalVisible, setMenuModalVisible] = useState(false);
	const [selectedMenuPost, setSelectedMenuPost] = useState<Post | null>(null);

	const loadProfile = async () => {
		try {
			const currentUser = await getCurrentUser();
			if (!currentUser) return;

			const profileData = await getUserProfile(currentUser.id);
			setUser(profileData);
			setPosts(profileData.posts);
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProfile();
	}, []);

	const handleEditProfile = () => {
		// TODO: Navigate to edit profile screen
		console.log("Navigate to edit profile");
	};

	const handleSettings = () => {
		// TODO: Navigate to settings
		console.log("Navigate to settings");
	};

	const handlePostPress = (post: Post) => {
		setSelectedPost(post);
		setPostDetailVisible(true);
	};

	const handleClosePostDetail = () => {
		setPostDetailVisible(false);
		setSelectedPost(null);
	};

	const handleLike = async (postId: string) => {
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

			// Update selected post if it's the same one
			if (selectedPost?.id === postId) {
				setSelectedPost((prev) =>
					prev
						? {
								...prev,
								is_liked: !prev.is_liked,
								likes_count: prev.is_liked
									? prev.likes_count - 1
									: prev.likes_count + 1,
							}
						: null,
				);
			}

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
		}
	};

	const handleComment = (postId: string) => {
		setSelectedPostId(postId);
		setCommentModalVisible(true);
		// Close post detail modal if open
		if (postDetailVisible) {
			setPostDetailVisible(false);
		}
	};

	const handleCloseComments = () => {
		setCommentModalVisible(false);
		setSelectedPostId(null);
	};

	const handleShare = (postId: string) => {
		// TODO: Implement share functionality
		console.log("Share post:", postId);
	};

	const handleProfilePress = (userId: string) => {
		router.push(`/(protected)/user-profile?userId=${userId}`);
	};

	const handleMenu = (post: Post) => {
		setSelectedMenuPost(post);
		setMenuModalVisible(true);
	};

	const handleCloseMenu = () => {
		setMenuModalVisible(false);
		setSelectedMenuPost(null);
	};

	const handleMenuDelete = async (postId: string) => {
		console.log("🗑️ Profile: Delete button clicked for post:", postId);
		try {
			console.log("🔄 Profile: Calling deletePost API...");
			await deletePost(postId);
			console.log("✅ Profile: Post deleted successfully from database");
			
			// Remove from local state
			setPosts(prev => {
				const newPosts = prev.filter(p => p.id !== postId);
				console.log("📱 Profile: Updated local state, posts count:", newPosts.length);
				return newPosts;
			});
			
			Alert.alert("Success", "Your post has been deleted.");
		} catch (error) {
			console.error("❌ Profile: Error deleting post:", error);
			console.error("Profile: Error details:", JSON.stringify(error, null, 2));
			const errorMessage = error instanceof Error ? error.message : String(error);
			Alert.alert("Error", `Failed to delete post: ${errorMessage}`);
		}
	};

	const handleMenuEdit = (postId: string) => {
		// TODO: Implement edit functionality
		console.log("Edit post:", postId);
		Alert.alert("Edit Post", "Edit functionality coming soon!");
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" />
				</View>
			</SafeAreaView>
		);
	}

	if (!user) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">Unable to load profile</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				<ProfileHeader
					user={user}
					isCurrentUser={true}
					postsCount={posts.length}
					onEditPress={handleEditProfile}
					onSettingsPress={handleSettings}
				/>
				<PostGrid posts={posts} onPostPress={handlePostPress} />
			</ScrollView>

			{/* Post Detail Modal */}
			<PostDetailModal
				visible={postDetailVisible}
				onClose={handleClosePostDetail}
				post={selectedPost}
				onLike={handleLike}
				onComment={handleComment}
				onShare={handleShare}
				onProfilePress={handleProfilePress}
				onMenu={handleMenu}
			/>

			{/* Post Menu Modal */}
			<PostMenuModal
				visible={menuModalVisible}
				onClose={handleCloseMenu}
				post={selectedMenuPost}
				isOwnPost={true} // All posts on profile page are user's own posts
				onDelete={handleMenuDelete}
				onEdit={handleMenuEdit}
			/>

			{/* Comment Modal */}
			<CommentModal
				visible={commentModalVisible}
				onClose={handleCloseComments}
				postId={selectedPostId || ""}
				onCommentAdded={() => {
					// Could refresh the post or update comment count
				}}
			/>
		</SafeAreaView>
	);
}
