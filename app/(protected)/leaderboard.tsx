import React, { useState, useEffect } from "react";
import {
	View,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { router } from "expo-router";
import {
	LeaderboardCard,
	LeaderboardEntry,
} from "@/components/gamification/LeaderboardCard";
import {
	AchievementBadges,
	Achievement,
	DEFAULT_ACHIEVEMENTS,
} from "@/components/gamification/AchievementBadges";
import { getLeaderboard, getUserEventStats } from "@/lib/api";

export default function LeaderboardScreen() {
	const { colorScheme } = useColorScheme();
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [currentUserStats, setCurrentUserStats] = useState<{
		totalPoints: number;
		questsCompleted: number;
		rank: number;
	}>({ totalPoints: 0, questsCompleted: 0, rank: 0 });
	const [achievements, setAchievements] = useState<Achievement[]>(
		DEFAULT_ACHIEVEMENTS
	);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<"leaderboard" | "achievements">(
		"leaderboard"
	);

	const loadData = async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			// Load leaderboard data
			const leaderboardData = await getLeaderboard();
			setLeaderboard(leaderboardData);

			// Load current user stats
			const userStats = await getUserEventStats();
			setCurrentUserStats(userStats);

			// Update achievements based on user progress
			const updatedAchievements = updateAchievements(userStats);
			setAchievements(updatedAchievements);
		} catch (error) {
			console.error("Error loading leaderboard data:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const updateAchievements = (userStats: {
		totalPoints: number;
		questsCompleted: number;
	}) => {
		return DEFAULT_ACHIEVEMENTS.map((achievement) => {
			const updated = { ...achievement };

			switch (achievement.id) {
				case "first-quest":
					updated.isUnlocked = userStats.questsCompleted >= 1;
					updated.progress = Math.min(userStats.questsCompleted / 1, 1);
					break;
				case "quest-master":
					updated.isUnlocked = userStats.questsCompleted >= 5;
					updated.progress = Math.min(userStats.questsCompleted / 5, 1);
					break;
				case "point-collector":
					updated.isUnlocked = userStats.totalPoints >= 100;
					updated.progress = Math.min(userStats.totalPoints / 100, 1);
					break;
				// Add more achievement logic as needed
			}

			if (updated.isUnlocked && !achievement.isUnlocked) {
				updated.unlockedAt = new Date().toISOString();
			}

			return updated;
		});
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleAchievementPress = (achievement: Achievement) => {
		// TODO: Show achievement detail modal
		console.log("Achievement pressed:", achievement);
	};

	const handleUserPress = (entry: LeaderboardEntry) => {
		// TODO: Navigate to user profile
		console.log("User pressed:", entry);
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
					<Text className="text-xl font-bold ml-4">Event Rankings</Text>
				</View>

				{/* Tab Selector */}
				<View className="flex-row mx-4 mt-4 mb-2 bg-muted rounded-lg p-1">
					<TouchableOpacity
						className={`flex-1 py-2 rounded-md ${
							activeTab === "leaderboard" ? "bg-background shadow-sm" : ""
						}`}
						onPress={() => setActiveTab("leaderboard")}
					>
						<Text
							className={`text-center font-medium ${
								activeTab === "leaderboard"
									? "text-foreground"
									: "text-muted-foreground"
							}`}
						>
							Leaderboard
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 py-2 rounded-md ${
							activeTab === "achievements" ? "bg-background shadow-sm" : ""
						}`}
						onPress={() => setActiveTab("achievements")}
					>
						<Text
							className={`text-center font-medium ${
								activeTab === "achievements"
									? "text-foreground"
									: "text-muted-foreground"
							}`}
						>
							Achievements
						</Text>
					</TouchableOpacity>
				</View>

				{/* Content */}
				<ScrollView
					className="flex-1"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => loadData(true)}
						/>
					}
				>
					{activeTab === "leaderboard" ? (
						<View>
							{/* Current User Stats */}
							<View className="bg-card border border-border rounded-lg mx-4 mb-4 p-4">
								<Text className="text-lg font-semibold mb-3">Your Progress</Text>
								<View className="flex-row justify-between">
									<View className="items-center">
										<Text className="text-2xl font-bold text-amber-600">
											{currentUserStats.totalPoints.toLocaleString()}
										</Text>
										<Text className="text-sm text-muted-foreground">
											Points
										</Text>
									</View>
									<View className="items-center">
										<Text className="text-2xl font-bold text-green-600">
											{currentUserStats.questsCompleted}
										</Text>
										<Text className="text-sm text-muted-foreground">
											Quests
										</Text>
									</View>
									<View className="items-center">
										<Text className="text-2xl font-bold text-blue-600">
											#{currentUserStats.rank}
										</Text>
										<Text className="text-sm text-muted-foreground">Rank</Text>
									</View>
								</View>
							</View>

							{/* Leaderboard */}
							<View className="bg-card border border-border rounded-lg mx-4 mb-4">
								<View className="px-4 py-3 border-b border-border">
									<Text className="text-lg font-semibold">Top Participants</Text>
								</View>
								{leaderboard.length === 0 ? (
									<View className="py-8 items-center">
										<Ionicons
											name="trophy"
											size={32}
											color={
												colorScheme === "dark"
													? colors.dark.mutedForeground
													: colors.light.mutedForeground
											}
										/>
										<Text className="text-muted-foreground mt-2">
											No rankings yet
										</Text>
									</View>
								) : (
									leaderboard.map((entry, index) => (
										<LeaderboardCard
											key={entry.id}
											entry={entry}
											onPress={handleUserPress}
										/>
									))
								)}
							</View>
						</View>
					) : (
						<View>
							{/* Unlocked Achievements */}
							<View className="mb-6">
								<Text className="text-lg font-semibold px-4 mb-3">
									Unlocked Achievements ({achievements.filter(a => a.isUnlocked).length})
								</Text>
								<AchievementBadges
									achievements={achievements}
									onAchievementPress={handleAchievementPress}
									showOnlyUnlocked
								/>
							</View>

							{/* All Achievements */}
							<View>
								<Text className="text-lg font-semibold px-4 mb-3">
									All Achievements
								</Text>
								<AchievementBadges
									achievements={achievements}
									onAchievementPress={handleAchievementPress}
								/>
							</View>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
} 