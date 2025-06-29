import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Post } from "@/lib/types";
import { getUserPoints } from "@/lib/storage";
import { getCurrentUser } from "@/lib/api";

interface PostCardProps {
	post: Post;
	onLike?: (postId: string) => void;
	onComment?: (postId: string) => void;
	onShare?: (postId: string) => void;
	onProfilePress?: (userId: string) => void;
	onMenu?: (postId: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");

// Generate stable mock points based on user ID
const getMockPoints = (userId: string): number => {
	// Use a simple hash of the user ID to generate consistent points
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		hash = ((hash << 5) - hash) + userId.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
	}
	// Return a number between 50 and 250
	return 50 + Math.abs(hash) % 200;
};

export function PostCard({
	post,
	onLike,
	onComment,
	onShare,
	onProfilePress,
	onMenu,
}: PostCardProps) {
	const { colorScheme } = useColorScheme();
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [userPoints, setUserPoints] = useState<number | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	// Get current user ID on mount
	useEffect(() => {
		getCurrentUser().then(user => {
			if (user) {
				setCurrentUserId(user.id);
			}
		});
	}, []);

	// Load points based on whether it's the current user
	useEffect(() => {
		if (!currentUserId) return;
		
		if (post.user_id === currentUserId) {
			// Real points for current user
			getUserPoints().then(points => setUserPoints(points));
		} else {
			// Stable mock points for other users
			setUserPoints(getMockPoints(post.user_id));
		}
	}, [post.user_id, currentUserId]);

	const handleLike = () => {
		onLike?.(post.id);
	};

	const handleComment = () => {
		onComment?.(post.id);
	};

	const handleShare = () => {
		onShare?.(post.id);
	};

	const handleProfilePress = () => {
		onProfilePress?.(post.user_id);
	};

	const handleMenu = () => {
		onMenu?.(post.id);
	};

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInDays > 0) {
			return `${diffInDays}d`;
		} else if (diffInHours > 0) {
			return `${diffInHours}h`;
		} else {
			const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
			return `${diffInMinutes}m`;
		}
	};

	return (
		<View className="bg-card rounded-2xl mb-4 mx-4 shadow-soft overflow-hidden">
			{/* Header */}
			<View className="flex-row items-center px-4 py-4">
				<TouchableOpacity
					onPress={handleProfilePress}
					className="flex-row items-center flex-1"
				>
					<View className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 mr-3 items-center justify-center overflow-hidden">
						{post.user?.avatar_url ? (
							<Image
								source={{ uri: post.user.avatar_url }}
								style={{ width: 40, height: 40, borderRadius: 20 }}
							/>
						) : (
							<Ionicons
								name="person"
								size={20}
								color="white"
							/>
						)}
					</View>
					<View className="flex-1">
						<View className="flex-row items-center">
							<Text className="font-bold text-base">
								{post.user?.username || "Unknown User"}
							</Text>
							{userPoints !== null && (
								<View className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full">
									<Text className="text-xs text-primary font-semibold">
										{userPoints} pts
									</Text>
								</View>
							)}
						</View>
						{post.location && (
							<Text className="text-xs text-muted-foreground mt-0.5">
								📍 {post.location}
							</Text>
						)}
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleMenu} className="p-2 -m-2">
					<Ionicons
						name="ellipsis-horizontal"
						size={20}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				</TouchableOpacity>
			</View>

			{/* Media */}
			{post.media && post.media.length > 0 && (
				<View>
					<Image
						source={{ uri: post.media[currentMediaIndex]?.media_url }}
						style={{
							width: screenWidth - 32,
							height: screenWidth - 32,
							backgroundColor:
								colorScheme === "dark" ? colors.dark.muted : colors.light.muted,
						}}
						contentFit="cover"
					/>
					{post.media.length > 1 && (
						<View className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded-full">
							<Text className="text-white text-xs font-medium">
								{currentMediaIndex + 1}/{post.media.length}
							</Text>
						</View>
					)}
				</View>
			)}

			{/* Actions */}
			<View className="px-4 py-4">
				<View className="flex-row items-center justify-between mb-3">
					<View className="flex-row gap-4">
						<TouchableOpacity onPress={handleLike} className="active:scale-110 transition-transform">
							<Ionicons
								name={post.is_liked ? "heart" : "heart-outline"}
								size={28}
								color={
									post.is_liked
										? "#ec4899"
										: colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
								}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleComment} className="active:scale-110 transition-transform">
							<Ionicons
								name="chatbubble-outline"
								size={26}
								color={
									colorScheme === "dark"
										? colors.dark.foreground
										: colors.light.foreground
								}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleShare} className="active:scale-110 transition-transform">
							<Ionicons
								name="paper-plane-outline"
								size={26}
								color={
									colorScheme === "dark"
										? colors.dark.foreground
										: colors.light.foreground
								}
							/>
						</TouchableOpacity>
					</View>
					<TouchableOpacity className="active:scale-110 transition-transform">
						<Ionicons
							name="bookmark-outline"
							size={26}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
				</View>

				{/* Likes count */}
				{post.likes_count > 0 && (
					<TouchableOpacity className="mb-2">
						<Text className="font-bold text-base">
							{post.likes_count.toLocaleString()}{" "}
							{post.likes_count === 1 ? "like" : "likes"}
						</Text>
					</TouchableOpacity>
				)}

				{/* Caption */}
				{post.caption && (
					<View className="mb-2">
						<Text className="text-base leading-5">
							<Text className="font-bold">{post.user?.username} </Text>
							{post.caption}
						</Text>
					</View>
				)}

				{/* Comments preview */}
				{post.comments_count > 0 && (
					<TouchableOpacity onPress={handleComment} className="mb-2">
						<Text className="text-muted-foreground text-sm font-medium">
							View all {post.comments_count} comments
						</Text>
					</TouchableOpacity>
				)}

				{/* Timestamp */}
				<Text className="text-xs text-muted-foreground uppercase font-medium">
					{formatTimeAgo(post.created_at)} ago
				</Text>
			</View>
		</View>
	);
}
