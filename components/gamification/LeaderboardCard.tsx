import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export interface LeaderboardEntry {
	id: string;
	participantId: string;
	displayName: string;
	totalPoints: number;
	questsCompleted: number;
	rankPosition: number;
	avatarUrl?: string;
	isCurrentUser?: boolean;
	lastUpdated: string;
}

interface LeaderboardCardProps {
	entry: LeaderboardEntry;
	onPress?: (entry: LeaderboardEntry) => void;
	showQuestCount?: boolean;
}

export function LeaderboardCard({
	entry,
	onPress,
	showQuestCount = true,
}: LeaderboardCardProps) {
	const { colorScheme } = useColorScheme();

	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1:
				return "#FFD700"; // Gold
			case 2:
				return "#C0C0C0"; // Silver
			case 3:
				return "#CD7F32"; // Bronze
			default:
				return colorScheme === "dark"
					? colors.dark.mutedForeground
					: colors.light.mutedForeground;
		}
	};

	const getRankIcon = (rank: number) => {
		if (rank <= 3) {
			return "trophy";
		}
		return "podium";
	};

	return (
		<TouchableOpacity
			onPress={() => onPress?.(entry)}
			className={`flex-row items-center py-4 px-4 ${
				entry.isCurrentUser
					? "bg-primary/10 border-primary/20 border rounded-lg mx-2"
					: ""
			}`}
		>
			{/* Rank */}
			<View className="w-12 items-center mr-3">
				<View className="flex-row items-center">
					<Ionicons
						name={getRankIcon(entry.rankPosition)}
						size={16}
						color={getRankColor(entry.rankPosition)}
					/>
					<Text
						className="text-sm font-bold ml-1"
						style={{ color: getRankColor(entry.rankPosition) }}
					>
						{entry.rankPosition}
					</Text>
				</View>
			</View>

			{/* Avatar */}
			<View className="w-12 h-12 rounded-full bg-muted mr-3 items-center justify-center">
				{entry.avatarUrl ? (
					<Image
						source={{ uri: entry.avatarUrl }}
						style={{ width: 48, height: 48, borderRadius: 24 }}
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

			{/* User Info */}
			<View className="flex-1 mr-3">
				<Text
					className={`font-semibold ${
						entry.isCurrentUser ? "text-primary" : ""
					}`}
				>
					{entry.displayName}
					{entry.isCurrentUser && (
						<Text className="text-sm text-primary font-normal"> (You)</Text>
					)}
				</Text>
				{showQuestCount && (
					<Text className="text-sm text-muted-foreground">
						{entry.questsCompleted} quest{entry.questsCompleted !== 1 ? "s" : ""} completed
					</Text>
				)}
			</View>

			{/* Points */}
			<View className="items-end">
				<View className="flex-row items-center">
					<Ionicons name="star" size={16} color="#F59E0B" />
					<Text className="text-lg font-bold text-amber-600 ml-1">
						{entry.totalPoints.toLocaleString()}
					</Text>
				</View>
				<Text className="text-xs text-muted-foreground">points</Text>
			</View>

			{/* Current user indicator */}
			{entry.isCurrentUser && (
				<View className="ml-2">
					<Ionicons name="person-circle" size={20} color="#3B82F6" />
				</View>
			)}
		</TouchableOpacity>
	);
} 