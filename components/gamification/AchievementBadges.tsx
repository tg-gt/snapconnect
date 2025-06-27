import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
	unlockedAt?: string;
	isUnlocked: boolean;
	progress?: number; // 0-1 for progress toward unlocking
	requirement?: string; // "Complete 5 quests", "Earn 100 points", etc.
}

interface AchievementBadgesProps {
	achievements: Achievement[];
	onAchievementPress?: (achievement: Achievement) => void;
	showOnlyUnlocked?: boolean;
	horizontal?: boolean;
}

export function AchievementBadges({
	achievements,
	onAchievementPress,
	showOnlyUnlocked = false,
	horizontal = false,
}: AchievementBadgesProps) {
	const { colorScheme } = useColorScheme();

	const filteredAchievements = showOnlyUnlocked
		? achievements.filter((a) => a.isUnlocked)
		: achievements;

	const renderAchievement = (achievement: Achievement) => (
		<TouchableOpacity
			key={achievement.id}
			onPress={() => onAchievementPress?.(achievement)}
			className={`${
				horizontal ? "mr-3" : "mb-3 w-full"
			} bg-card border border-border rounded-lg p-3`}
		>
			<View className={`${horizontal ? "items-center" : "flex-row items-start"}`}>
				{/* Badge Icon */}
				<View
					className={`w-12 h-12 rounded-xl items-center justify-center ${
						horizontal ? "mb-2" : "mr-3"
					} ${
						achievement.isUnlocked
							? "bg-opacity-20"
							: "bg-muted opacity-50"
					}`}
					style={{
						backgroundColor: achievement.isUnlocked
							? `${achievement.color}20`
							: undefined,
					}}
				>
					<Ionicons
						name={achievement.icon}
						size={24}
						color={
							achievement.isUnlocked
								? achievement.color
								: colorScheme === "dark"
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
				</View>

				{/* Badge Info */}
				<View className={`${horizontal ? "items-center" : "flex-1"}`}>
					<Text
						className={`font-semibold ${
							horizontal ? "text-center text-sm" : "text-base"
						} ${achievement.isUnlocked ? "" : "text-muted-foreground"}`}
					>
						{achievement.title}
					</Text>
					
					{!horizontal && (
						<Text className="text-sm text-muted-foreground mt-1">
							{achievement.description}
						</Text>
					)}

					{/* Progress Bar for locked achievements */}
					{!achievement.isUnlocked && achievement.progress !== undefined && (
						<View className="w-full bg-muted rounded-full h-2 mt-2">
							<View
								className="bg-primary rounded-full h-2"
								style={{ width: `${achievement.progress * 100}%` }}
							/>
						</View>
					)}

					{/* Requirement text */}
					{!achievement.isUnlocked && achievement.requirement && !horizontal && (
						<Text className="text-xs text-muted-foreground mt-1">
							{achievement.requirement}
						</Text>
					)}

					{/* Unlock date */}
					{achievement.isUnlocked && achievement.unlockedAt && !horizontal && (
						<Text className="text-xs text-muted-foreground mt-1">
							Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
						</Text>
					)}
				</View>

				{/* Unlock indicator */}
				{achievement.isUnlocked && !horizontal && (
					<Ionicons
						name="checkmark-circle"
						size={20}
						color="#10B981"
						style={{ marginLeft: 8 }}
					/>
				)}
			</View>
		</TouchableOpacity>
	);

	if (horizontal) {
		return (
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="py-2"
				contentContainerStyle={{ paddingHorizontal: 16 }}
			>
				{filteredAchievements.map(renderAchievement)}
			</ScrollView>
		);
	}

	return (
		<View className="px-4">
			{filteredAchievements.map(renderAchievement)}
		</View>
	);
}

// Predefined achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
	{
		id: "first-quest",
		title: "First Steps",
		description: "Complete your first quest",
		icon: "footsteps",
		color: "#10B981",
		isUnlocked: false,
		requirement: "Complete 1 quest",
	},
	{
		id: "quest-master",
		title: "Quest Master",
		description: "Complete 5 quests",
		icon: "trophy",
		color: "#F59E0B",
		isUnlocked: false,
		requirement: "Complete 5 quests",
	},
	{
		id: "point-collector",
		title: "Point Collector",
		description: "Earn 100 points",
		icon: "star",
		color: "#8B5CF6",
		isUnlocked: false,
		requirement: "Earn 100 points",
	},
	{
		id: "social-butterfly",
		title: "Social Butterfly",
		description: "Make 10 connections",
		icon: "people",
		color: "#EC4899",
		isUnlocked: false,
		requirement: "Connect with 10 people",
	},
	{
		id: "explorer",
		title: "Explorer",
		description: "Visit 3 different locations",
		icon: "compass",
		color: "#06B6D4",
		isUnlocked: false,
		requirement: "Check in at 3 locations",
	},
	{
		id: "photographer",
		title: "Photographer",
		description: "Complete 3 photo quests",
		icon: "camera",
		color: "#EF4444",
		isUnlocked: false,
		requirement: "Complete 3 photo quests",
	},
]; 