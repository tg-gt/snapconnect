import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface PointsDisplayProps {
	totalPoints: number;
	questsCompleted: number;
	rank?: number;
	achievements?: number;
	onLeaderboardPress?: () => void;
	onAchievementsPress?: () => void;
}

export function PointsDisplay({
	totalPoints,
	questsCompleted,
	rank,
	achievements = 0,
	onLeaderboardPress,
	onAchievementsPress,
}: PointsDisplayProps) {
	const { colorScheme } = useColorScheme();

	return (
		<View className="bg-card border border-border rounded-lg p-4 mx-4 mb-4">
			{/* Header */}
			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-lg font-semibold">Event Progress</Text>
				<TouchableOpacity
					onPress={onLeaderboardPress}
					className="flex-row items-center"
				>
					<Ionicons
						name="trophy"
						size={16}
						color={
							colorScheme === "dark"
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
					<Text className="text-sm text-muted-foreground ml-1">
						Leaderboard
					</Text>
				</TouchableOpacity>
			</View>

			{/* Stats Grid */}
			<View className="flex-row justify-between">
				{/* Total Points */}
				<View className="flex-1 items-center">
					<View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-2">
						<Ionicons name="star" size={20} color="#F59E0B" />
					</View>
					<Text className="text-2xl font-bold text-amber-600">
						{totalPoints.toLocaleString()}
					</Text>
					<Text className="text-xs text-muted-foreground">Points</Text>
				</View>

				{/* Quests Completed */}
				<View className="flex-1 items-center">
					<View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-2">
						<Ionicons name="checkmark-circle" size={20} color="#10B981" />
					</View>
					<Text className="text-2xl font-bold text-green-600">
						{questsCompleted}
					</Text>
					<Text className="text-xs text-muted-foreground">Quests</Text>
				</View>

				{/* Rank */}
				<View className="flex-1 items-center">
					<View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-2">
						<Ionicons name="podium" size={20} color="#3B82F6" />
					</View>
					<Text className="text-2xl font-bold text-blue-600">
						{rank ? `#${rank}` : "—"}
					</Text>
					<Text className="text-xs text-muted-foreground">Rank</Text>
				</View>

				{/* Achievements */}
				<TouchableOpacity
					className="flex-1 items-center"
					onPress={onAchievementsPress}
				>
					<View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mb-2">
						<Ionicons name="medal" size={20} color="#8B5CF6" />
					</View>
					<Text className="text-2xl font-bold text-purple-600">
						{achievements}
					</Text>
					<Text className="text-xs text-muted-foreground">Badges</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
} 