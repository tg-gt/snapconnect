import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
					borderTopColor:
						colorScheme === "dark" ? colors.dark.border : colors.light.border,
					borderTopWidth: 1,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarInactiveTintColor:
					colorScheme === "dark"
						? colors.dark.mutedForeground
						: colors.light.mutedForeground,
				tabBarShowLabel: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="quests"
				options={{
					title: "Quests",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="trophy" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="create"
				options={{
					title: "Create",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="add-circle" size={size + 4} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="activity"
				options={{
					title: "Activity",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-circle" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
