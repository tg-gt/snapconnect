import React, { useState, useEffect } from "react";
import {
	View,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { getActivities, markActivitiesAsRead, getUserEventStats } from "@/lib/api";
import { Activity } from "@/lib/types";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { EventAssistant } from "@/components/chat/EventAssistant";
import { router } from "expo-router";

export default function ActivityScreen() {
	const { colorScheme } = useColorScheme();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [userStats, setUserStats] = useState<{
		totalPoints: number;
		questsCompleted: number;
		rank: number;
	}>({ totalPoints: 0, questsCompleted: 0, rank: 0 });
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [showAssistant, setShowAssistant] = useState(false);

	const loadActivities = async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			// Load activities
			const data = await getActivities();
			setActivities(data);

			// Load user stats for gamification
			const stats = await getUserEventStats();
			setUserStats(stats);

			// Mark unread activities as read
			const unreadIds = data.filter((a) => !a.is_read).map((a) => a.id);
			if (unreadIds.length > 0) {
				await markActivitiesAsRead(unreadIds);
			}
		} catch (error) {
			console.error("Error loading activities:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadActivities();
	}, []);

	const handleLeaderboardPress = () => {
		router.push("/(protected)/leaderboard");
	};

	const handleAchievementsPress = () => {
		router.push("/(protected)/leaderboard");
	};

	const handleActivityPress = (activity: Activity) => {
		// TODO: Navigate to relevant screen based on activity type
		if (activity.post_id) {
			console.log("Navigate to post:", activity.post_id);
		} else if (activity.activity_type === "follow") {
			console.log("Navigate to profile:", activity.actor_id);
		} else if (activity.activity_type === "quest_completed") {
			// Navigate to quest detail
			router.push(`/(protected)/quest-detail?questId=${activity.quest_id}`);
		} else if (activity.activity_type === "achievement_unlocked" || activity.activity_type === "rank_updated") {
			// Navigate to leaderboard/achievements
			router.push("/(protected)/leaderboard");
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

	const getActivityText = (activity: Activity) => {
		const username = activity.actor?.username || "Someone";
		switch (activity.activity_type) {
			case "like":
				return `${username} liked your post`;
			case "comment":
				return `${username} commented on your post`;
			case "follow":
				return `${username} started following you`;
			case "mention":
				return `${username} mentioned you in a comment`;
			case "quest_completed":
				return `You completed a quest and earned ${activity.points_earned} points!`;
			case "achievement_unlocked":
				return `New achievement unlocked!`;
			case "points_earned":
				return `You earned ${activity.points_earned} points!`;
			case "rank_updated":
				return `You moved up to rank #${activity.rank_position}!`;
			default:
				return `${username} interacted with your content`;
		}
	};

	const getActivityIcon = (activity: Activity) => {
		switch (activity.activity_type) {
			case "like":
				return { name: "heart" as const, color: "#FF3040" };
			case "comment":
				return {
					name: "chatbubble" as const,
					color:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				};
			case "follow":
				return { name: "person-add" as const, color: "#0095F6" };
			case "mention":
				return {
					name: "at" as const,
					color:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				};
			case "quest_completed":
				return { name: "checkmark-circle" as const, color: "#10B981" };
			case "achievement_unlocked":
				return { name: "medal" as const, color: "#8B5CF6" };
			case "points_earned":
				return { name: "star" as const, color: "#F59E0B" };
			case "rank_updated":
				return { name: "trophy" as const, color: "#3B82F6" };
			default:
				return {
					name: "notifications" as const,
					color:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				};
		}
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

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="px-4 py-3 border-b border-border">
					<Text className="text-2xl font-bold">Activity</Text>
				</View>

				{/* Points Display */}
				<PointsDisplay
					totalPoints={userStats.totalPoints}
					questsCompleted={userStats.questsCompleted}
					rank={userStats.rank}
					achievements={3} // Mock count - would be calculated from actual achievements
					onLeaderboardPress={handleLeaderboardPress}
					onAchievementsPress={handleAchievementsPress}
				/>

				{/* Activities List */}
				<ScrollView
					className="flex-1"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => loadActivities(true)}
						/>
					}
				>
					{activities.length === 0 ? (
						<View className="flex-1 items-center justify-center py-12">
							<View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
								<Ionicons
									name="heart"
									size={32}
									color={
										colorScheme === "dark"
											? colors.dark.mutedForeground
											: colors.light.mutedForeground
									}
								/>
							</View>
							<Text className="text-xl font-bold mb-2">No Activity Yet</Text>
							<Text className="text-muted-foreground text-center px-8">
								When people like, comment or follow you, you&apos;ll see it here
							</Text>
						</View>
					) : (
						<View className="px-4 py-2">
							{activities.map((activity, index) => {
								const icon = getActivityIcon(activity);
								return (
									<TouchableOpacity
										key={activity.id}
										onPress={() => handleActivityPress(activity)}
										className="flex-row items-center py-3"
									>
										{/* Actor Avatar */}
										<View className="w-10 h-10 rounded-full bg-muted mr-3 items-center justify-center">
											{activity.actor?.avatar_url ? (
												<Image
													source={{ uri: activity.actor.avatar_url }}
													style={{ width: 40, height: 40, borderRadius: 20 }}
												/>
											) : (
												<Ionicons
													name="person"
													size={20}
													color={
														colorScheme === "dark"
															? colors.dark.mutedForeground
															: colors.light.mutedForeground
													}
												/>
											)}
										</View>

										{/* Activity Content */}
										<View className="flex-1 mr-3">
											<Text className="text-sm leading-5">
												{getActivityText(activity)}
											</Text>
											<Text className="text-xs text-muted-foreground mt-1">
												{formatTimeAgo(activity.created_at)}
											</Text>
										</View>

										{/* Activity Icon */}
										<View className="mr-3">
											<Ionicons name={icon.name} size={20} color={icon.color} />
										</View>

										{/* Post Thumbnail (if applicable) */}
										{activity.post?.media && activity.post.media.length > 0 && (
											<View className="w-10 h-10">
												<Image
													source={{ uri: activity.post.media[0].media_url }}
													style={{ width: 40, height: 40 }}
													contentFit="cover"
												/>
											</View>
										)}
									</TouchableOpacity>
								);
							})}
						</View>
					)}
				</ScrollView>

				{/* Floating Chat Button */}
				<TouchableOpacity
					className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg z-10"
					onPress={() => setShowAssistant(true)}
					style={{
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
					}}
				>
					<Ionicons name="chatbubble" size={24} color="white" />
				</TouchableOpacity>

				{/* Event Assistant Modal */}
				<EventAssistant 
					visible={showAssistant}
					onClose={() => setShowAssistant(false)}
				/>
			</View>
		</SafeAreaView>
	);
}
