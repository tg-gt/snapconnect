import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { getUserProfile, followUser, unfollowUser } from "@/lib/api";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { User, Post } from "@/lib/types";

export default function UserProfileScreen() {
	const { colorScheme } = useColorScheme();
	const { userId } = useLocalSearchParams<{ userId: string }>();
	const [user, setUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);

	const loadProfile = useCallback(async () => {
		if (!userId) return;

		try {
			const profileData = await getUserProfile(userId);
			setUser(profileData);
			setPosts(profileData.posts);
			setIsFollowing(profileData.is_following || false);
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		loadProfile();
	}, [userId, loadProfile]);

	const handleFollowPress = async () => {
		if (!user || followLoading) return;

		setFollowLoading(true);
		try {
			if (isFollowing) {
				await unfollowUser(user.id);
				setIsFollowing(false);
				setUser((prev) =>
					prev
						? {
								...prev,
								followers_count: prev.followers_count - 1,
							}
						: null,
				);
			} else {
				await followUser(user.id);
				setIsFollowing(true);
				setUser((prev) =>
					prev
						? {
								...prev,
								followers_count: prev.followers_count + 1,
							}
						: null,
				);
			}
		} catch (error) {
			console.error("Error toggling follow:", error);
		} finally {
			setFollowLoading(false);
		}
	};

	const handlePostPress = (post: Post) => {
		// TODO: Navigate to post details
		console.log("Navigate to post:", post.id);
	};

	const handleMessage = () => {
		// TODO: Navigate to messages
		console.log("Open message with user:", user?.id);
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-row items-center px-4 py-3 border-b border-border">
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons
							name="arrow-back"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
					<Text className="text-lg font-semibold ml-4">Profile</Text>
				</View>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" />
				</View>
			</SafeAreaView>
		);
	}

	if (!user) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-row items-center px-4 py-3 border-b border-border">
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons
							name="arrow-back"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
					<Text className="text-lg font-semibold ml-4">Profile</Text>
				</View>
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">User not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center px-4 py-3 border-b border-border">
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons
						name="arrow-back"
						size={24}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				</TouchableOpacity>
				<Text className="text-lg font-semibold ml-4">{user.username}</Text>
			</View>

			<ScrollView className="flex-1">
				<ProfileHeader
					user={user}
					isCurrentUser={false}
					isFollowing={isFollowing}
					onFollowPress={handleFollowPress}
				/>
				<PostGrid posts={posts} onPostPress={handlePostPress} />
			</ScrollView>
		</SafeAreaView>
	);
}
