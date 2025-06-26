import React from "react";
import {
	View,
	ScrollView,
	TouchableOpacity,
	Image,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Story, User } from "@/lib/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface StoriesBarProps {
	stories: Story[];
	currentUser: User | null;
	onStoryPress: (story: Story) => void;
	onCreateStory: () => void;
}

interface UserStories {
	user: User;
	stories: Story[];
	hasUnviewed: boolean;
}

export function StoriesBar({
	stories,
	currentUser,
	onStoryPress,
	onCreateStory,
}: StoriesBarProps) {
	const { colorScheme } = useColorScheme();

	// Group stories by user
	const userStoriesMap = new Map<string, UserStories>();

	stories.forEach((story) => {
		if (!story.user) return;

		const userId = story.user.id;
		if (!userStoriesMap.has(userId)) {
			userStoriesMap.set(userId, {
				user: story.user,
				stories: [],
				hasUnviewed: false,
			});
		}

		const userStories = userStoriesMap.get(userId)!;
		userStories.stories.push(story);
		if (!story.has_viewed) {
			userStories.hasUnviewed = true;
		}
	});

	const userStoriesList = Array.from(userStoriesMap.values());

	// Sort: current user first, then by unviewed status, then by latest story
	userStoriesList.sort((a, b) => {
		if (a.user.id === currentUser?.id) return -1;
		if (b.user.id === currentUser?.id) return 1;
		if (a.hasUnviewed && !b.hasUnviewed) return -1;
		if (!a.hasUnviewed && b.hasUnviewed) return 1;
		return (
			new Date(b.stories[0].created_at).getTime() - 
			new Date(a.stories[0].created_at).getTime()
		);
	});

	return (
		<View className="bg-background border-b border-border">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
			>
				{/* Current user's story or create story */}
				{currentUser && (
					<TouchableOpacity
						onPress={() => {
							// If user has stories, show the first one, otherwise create new
							const currentUserStories = userStoriesList.find(us => us.user.id === currentUser.id);
							if (currentUserStories) {
								onStoryPress(currentUserStories.stories[0]);
							} else {
								onCreateStory();
							}
						}}
						className="items-center mr-4"
						style={{ width: 70 }}
					>
						<View className="relative">
							{(() => {
								const currentUserStories = userStoriesList.find(us => us.user.id === currentUser.id);
								if (currentUserStories) {
									// Show story ring if user has stories
									return (
										<View
											className={`w-16 h-16 rounded-full p-0.5 ${
												currentUserStories.hasUnviewed
													? "bg-gradient-to-r from-purple-500 to-pink-500"
													: "bg-muted-foreground"
											}`}
										>
											<View className="w-full h-full rounded-full bg-background p-0.5">
												{currentUser.avatar_url ? (
													<Image
														source={{ uri: currentUser.avatar_url }}
														style={{ width: "100%", height: "100%", borderRadius: 32 }}
													/>
												) : (
													<View className="w-full h-full rounded-full bg-muted items-center justify-center">
														<Ionicons
															name="person"
															size={24}
															color={
																colorScheme === "dark"
																	? colors.dark.mutedForeground
																	: colors.light.mutedForeground
															}
														/>
													</View>
												)}
											</View>
										</View>
									);
								} else {
									// Show create story button if no stories
									return (
										<>
											<View className="w-16 h-16 rounded-full bg-muted items-center justify-center">
												{currentUser.avatar_url ? (
													<Image
														source={{ uri: currentUser.avatar_url }}
														style={{ width: 64, height: 64, borderRadius: 32 }}
													/>
												) : (
													<Ionicons
														name="person"
														size={24}
														color={
															colorScheme === "dark"
																? colors.dark.mutedForeground
																: colors.light.mutedForeground
														}
													/>
												)}
											</View>
											<View className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-background">
												<Ionicons name="add" size={14} color="white" />
											</View>
										</>
									);
								}
							})()}
						</View>
						<Text className="text-xs mt-1 text-center" numberOfLines={1}>
							{userStoriesList.find(us => us.user.id === currentUser.id) ? "Your story" : "Your story"}
						</Text>
					</TouchableOpacity>
				)}

				{/* Other users' stories */}
				{userStoriesList
					.filter((userStories) => userStories.user.id !== currentUser?.id)
					.map((userStories) => (
						<TouchableOpacity
							key={userStories.user.id}
							onPress={() => onStoryPress(userStories.stories[0])}
							className="items-center mr-4"
							style={{ width: 70 }}
						>
							<View className="relative">
								{/* Story ring */}
								<View
									className={`w-16 h-16 rounded-full p-0.5 ${
										userStories.hasUnviewed
											? "bg-gradient-to-r from-purple-500 to-pink-500"
											: "bg-muted-foreground"
									}`}
								>
									<View className="w-full h-full rounded-full bg-background p-0.5">
										{userStories.user.avatar_url ? (
											<Image
												source={{ uri: userStories.user.avatar_url }}
												style={{ width: "100%", height: "100%", borderRadius: 32 }}
											/>
										) : (
											<View className="w-full h-full rounded-full bg-muted items-center justify-center">
												<Ionicons
													name="person"
													size={24}
													color={
														colorScheme === "dark"
															? colors.dark.mutedForeground
															: colors.light.mutedForeground
													}
												/>
											</View>
										)}
									</View>
								</View>
							</View>
							<Text className="text-xs mt-1 text-center" numberOfLines={1}>
								{userStories.user.username}
							</Text>
						</TouchableOpacity>
					))}
			</ScrollView>
		</View>
	);
} 