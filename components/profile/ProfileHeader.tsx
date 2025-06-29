import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { User } from "@/lib/types";
import { getUserPoints } from "@/lib/storage";
import { useEffect, useState } from "react";

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

interface ProfileHeaderProps {
	user: User;
	isCurrentUser?: boolean;
	isFollowing?: boolean;
	postsCount?: number;
	onFollowPress?: () => void;
	onEditPress?: () => void;
	onSettingsPress?: () => void;
}

export function ProfileHeader({
	user,
	isCurrentUser = false,
	isFollowing = false,
	postsCount,
	onFollowPress,
	onEditPress,
	onSettingsPress,
}: ProfileHeaderProps) {
	const { colorScheme } = useColorScheme();
	const [userPoints, setUserPoints] = useState<number | null>(null);

	// Load points for current user
	useEffect(() => {
		if (isCurrentUser) {
			// Real points for current user
			getUserPoints().then(points => setUserPoints(points));
		} else {
			// Stable mock points for other users
			setUserPoints(getMockPoints(user.id));
		}
	}, [isCurrentUser, user.id]);

	return (
		<View>
			{/* Gradient Background Header */}
			<View className="gradient-primary h-32 relative">
				{isCurrentUser && (
					<TouchableOpacity
						onPress={onSettingsPress}
						className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
					>
						<Ionicons
							name="settings-outline"
							size={22}
							color="white"
						/>
					</TouchableOpacity>
				)}
			</View>
			
			<View className="px-4 -mt-12">
				{/* Avatar */}
				<View className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 mb-4">
					<View className="w-full h-full rounded-full bg-background items-center justify-center overflow-hidden">
						{user.avatar_url ? (
							<Image
								source={{ uri: user.avatar_url }}
								style={{ width: 88, height: 88, borderRadius: 44 }}
							/>
						) : (
							<Ionicons
								name="person"
								size={40}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
							/>
						)}
					</View>
				</View>

				{/* User info */}
				<View className="mb-4">
					<View className="flex-row items-center mb-2">
						<Text className="font-bold text-2xl">{user.username}</Text>
						{userPoints !== null && (
							<View className="ml-3 bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 rounded-full">
								<Text className="text-sm text-white font-semibold">
									{userPoints} pts
								</Text>
							</View>
						)}
					</View>
					{user.full_name && (
						<Text className="font-medium text-base text-muted-foreground mb-2">{user.full_name}</Text>
					)}
					{user.bio && <Text className="text-base leading-5 mb-3">{user.bio}</Text>}
					{user.website && (
						<TouchableOpacity>
							<Text className="text-primary text-base font-medium">🔗 {user.website}</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Stats */}
				<View className="flex-row justify-around bg-secondary/30 rounded-2xl p-4 mb-4">
					<View className="items-center">
						<Text className="font-bold text-2xl">{postsCount ?? user.posts_count}</Text>
						<Text className="text-muted-foreground text-sm">Posts</Text>
					</View>
					<TouchableOpacity className="items-center">
						<Text className="font-bold text-2xl">{user.followers_count}</Text>
						<Text className="text-muted-foreground text-sm">Followers</Text>
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<Text className="font-bold text-2xl">{user.following_count}</Text>
						<Text className="text-muted-foreground text-sm">Following</Text>
					</TouchableOpacity>
				</View>

				{/* Action buttons */}
				<View className="flex-row gap-3 mb-6">
					{isCurrentUser ? (
						<Button onPress={onEditPress} variant="outline" className="flex-1 border-2">
							<Text className="font-semibold">Edit Profile</Text>
						</Button>
					) : (
						<>
							<Button
								onPress={onFollowPress}
								variant={isFollowing ? "outline" : "default"}
								className="flex-1"
							>
								<Text className="font-semibold">{isFollowing ? "Following" : "Follow"}</Text>
							</Button>
							<TouchableOpacity className="w-12 h-12 bg-secondary rounded-lg items-center justify-center">
								<Ionicons
									name="mail-outline"
									size={22}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
								/>
							</TouchableOpacity>
						</>
					)}
				</View>
			</View>
		</View>
	);
}
