import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { getCurrentUser, getUserProfile } from "@/lib/api";
import { User, Post } from "@/lib/types";

export default function ProfileScreen() {
	const [user, setUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

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
		// TODO: Navigate to post details
		console.log("Navigate to post:", post.id);
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
					onEditPress={handleEditProfile}
					onSettingsPress={handleSettings}
				/>
				<PostGrid posts={posts} onPostPress={handlePostPress} />
			</ScrollView>
		</SafeAreaView>
	);
}
