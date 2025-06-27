import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PointsAchievementIconProps {
	type: "quest" | "achievement" | "points" | "rank";
	size?: number;
}

export function PointsAchievementIcon({
	type,
	size = 20,
}: PointsAchievementIconProps) {
	const getIconConfig = () => {
		switch (type) {
			case "quest":
				return { name: "checkmark-circle" as const, color: "#10B981" };
			case "achievement":
				return { name: "medal" as const, color: "#8B5CF6" };
			case "points":
				return { name: "star" as const, color: "#F59E0B" };
			case "rank":
				return { name: "trophy" as const, color: "#3B82F6" };
			default:
				return { name: "star" as const, color: "#F59E0B" };
		}
	};

	const { name, color } = getIconConfig();

	return (
		<View className="w-8 h-8 rounded-full items-center justify-center"
			style={{ backgroundColor: `${color}20` }}>
			<Ionicons name={name} size={size} color={color} />
		</View>
	);
} 