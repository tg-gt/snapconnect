import React, { useState } from "react";
import {
	Modal,
	View,
	TouchableOpacity,
	ScrollView,
	Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Post } from "@/lib/types";

interface PostDetailModalProps {
	visible: boolean;
	onClose: () => void;
	post: Post | null;
	onLike?: (postId: string) => void;
	onComment?: (postId: string) => void;
	onShare?: (postId: string) => void;
	onProfilePress?: (userId: string) => void;
	onMenu?: (post: Post) => void;
}

const { width: screenWidth } = Dimensions.get("window");

export function PostDetailModal({
	visible,
	onClose,
	post,
	onLike,
	onComment,
	onShare,
	onProfilePress,
	onMenu,
}: PostDetailModalProps) {
	const { colorScheme } = useColorScheme();
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

	if (!post) return null;

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
		if (post) {
			onMenu?.(post);
		}
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
		<Modal
			visible={visible}
			animationType="fade"
			presentationStyle="fullScreen"
		>
			<View className={`flex-1 ${colorScheme === "dark" ? "bg-black" : "bg-white"}`}>
				{/* Header */}
				<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
					<TouchableOpacity onPress={onClose}>
						<Ionicons
							name="close"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
					<Text className="text-lg font-semibold">Post</Text>
					<TouchableOpacity onPress={handleMenu}>
						<Ionicons
							name="ellipsis-horizontal"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
				</View>

				<ScrollView className="flex-1">
					{/* Post Header */}
					<View className="flex-row items-center px-4 py-3 border-b border-border">
						<TouchableOpacity
							onPress={handleProfilePress}
							className="flex-row items-center flex-1"
						>
							<View className="w-8 h-8 rounded-full bg-muted mr-3 items-center justify-center">
								{post.user?.avatar_url ? (
									<Image
										source={{ uri: post.user.avatar_url }}
										style={{ width: 32, height: 32, borderRadius: 16 }}
									/>
								) : (
									<Ionicons
										name="person"
										size={16}
										color={
											colorScheme === "dark"
												? colors.dark.mutedForeground
												: colors.light.mutedForeground
										}
									/>
								)}
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-sm">
									{post.user?.username || "Unknown User"}
								</Text>
								{post.location && (
									<Text className="text-xs text-muted-foreground">
										{post.location}
									</Text>
								)}
							</View>
						</TouchableOpacity>
					</View>

					{/* Media */}
					{post.media && post.media.length > 0 && (
						<View>
							<Image
								source={{ uri: post.media[currentMediaIndex]?.media_url }}
								style={{
									width: screenWidth,
									height: screenWidth,
									backgroundColor:
										colorScheme === "dark" ? colors.dark.muted : colors.light.muted,
								}}
								contentFit="cover"
							/>
							{post.media.length > 1 && (
								<View className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded-full">
									<Text className="text-white text-xs">
										{currentMediaIndex + 1}/{post.media.length}
									</Text>
								</View>
							)}
						</View>
					)}

					{/* Actions */}
					<View className="px-4 py-3">
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-row space-x-4">
								<TouchableOpacity onPress={handleLike}>
									<Ionicons
										name={post.is_liked ? "heart" : "heart-outline"}
										size={24}
										color={
											post.is_liked
												? "#FF3040"
												: colorScheme === "dark"
													? colors.dark.foreground
													: colors.light.foreground
										}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={handleComment}>
									<Ionicons
										name="chatbubble-outline"
										size={24}
										color={
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground
										}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={handleShare}>
									<Ionicons
										name="paper-plane-outline"
										size={24}
										color={
											colorScheme === "dark"
												? colors.dark.foreground
												: colors.light.foreground
										}
									/>
								</TouchableOpacity>
							</View>
							<TouchableOpacity>
								<Ionicons
									name="bookmark-outline"
									size={24}
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
								<Text className="font-semibold text-sm">
									{post.likes_count.toLocaleString()}{" "}
									{post.likes_count === 1 ? "like" : "likes"}
								</Text>
							</TouchableOpacity>
						)}

						{/* Caption */}
						{post.caption && (
							<View className="mb-2">
								<Text className="text-sm">
									<Text className="font-semibold">{post.user?.username} </Text>
									{post.caption}
								</Text>
							</View>
						)}

						{/* Comments preview */}
						{post.comments_count > 0 && (
							<TouchableOpacity onPress={handleComment} className="mb-2">
								<Text className="text-muted-foreground text-sm">
									View all {post.comments_count} comments
								</Text>
							</TouchableOpacity>
						)}

						{/* Timestamp */}
						<Text className="text-xs text-muted-foreground">
							{formatTimeAgo(post.created_at)}
						</Text>
					</View>
				</ScrollView>
			</View>
		</Modal>
	);
}