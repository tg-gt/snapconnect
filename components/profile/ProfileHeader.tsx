import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { User } from "@/lib/types";

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

	return (
		<View className="px-4 py-6">
			{/* Top row with avatar and stats */}
			<View className="flex-row items-center mb-4">
				{/* Avatar */}
				<View className="w-20 h-20 rounded-full bg-muted mr-6 items-center justify-center">
					{user.avatar_url ? (
						<Image
							source={{ uri: user.avatar_url }}
							style={{ width: 80, height: 80, borderRadius: 40 }}
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

				{/* Stats */}
				<View className="flex-1 flex-row justify-around">
					<View className="items-center">
						<Text className="font-bold text-lg">{postsCount ?? user.posts_count}</Text>
						<Text className="text-muted-foreground text-sm">Posts</Text>
					</View>
					<TouchableOpacity className="items-center">
						<Text className="font-bold text-lg">{user.followers_count}</Text>
						<Text className="text-muted-foreground text-sm">Followers</Text>
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<Text className="font-bold text-lg">{user.following_count}</Text>
						<Text className="text-muted-foreground text-sm">Following</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* User info */}
			<View className="mb-4">
				<Text className="font-semibold text-base mb-1">{user.full_name}</Text>
				{user.bio && <Text className="text-sm leading-5 mb-2">{user.bio}</Text>}
				{user.website && (
					<TouchableOpacity>
						<Text className="text-blue-500 text-sm">{user.website}</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Action buttons */}
			<View className="flex-row space-x-2">
				{isCurrentUser ? (
					<>
						<Button onPress={onEditPress} variant="outline" className="flex-1">
							<Text>Edit Profile</Text>
						</Button>
						<TouchableOpacity
							onPress={onSettingsPress}
							className="w-10 h-10 border border-border rounded-md items-center justify-center"
						>
							<Ionicons
								name="settings-outline"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.foreground
										: colors.light.foreground
								}
							/>
						</TouchableOpacity>
					</>
				) : (
					<>
						<Button
							onPress={onFollowPress}
							variant={isFollowing ? "outline" : "default"}
							className="flex-1"
						>
							<Text>{isFollowing ? "Following" : "Follow"}</Text>
						</Button>
						<TouchableOpacity className="w-10 h-10 border border-border rounded-md items-center justify-center">
							<Ionicons
								name="mail-outline"
								size={20}
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
	);
}
