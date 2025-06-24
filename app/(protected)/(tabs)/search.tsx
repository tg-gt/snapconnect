import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { searchUsers } from "@/lib/api";
import { User } from "@/lib/types";
import { useRouter } from "expo-router";

export default function SearchScreen() {
	const { colorScheme } = useColorScheme();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		if (query.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		setLoading(true);
		try {
			const results = await searchUsers(query.trim());
			setSearchResults(results);
		} catch (error) {
			console.error("Error searching users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleUserPress = (user: User) => {
		router.push(`/(protected)/user-profile?userId=${user.id}`);
	};

	const clearSearch = () => {
		setSearchQuery("");
		setSearchResults([]);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Search Header */}
				<View className="px-4 py-3 border-b border-border">
					<View className="flex-row items-center bg-muted rounded-full px-4 py-2">
						<Ionicons
							name="search"
							size={20}
							color={
								colorScheme === "dark"
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
						/>
						<TextInput
							value={searchQuery}
							onChangeText={handleSearch}
							placeholder="Search users..."
							placeholderTextColor={
								colorScheme === "dark"
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
							className={`flex-1 ml-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}
							autoCapitalize="none"
							autoCorrect={false}
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={clearSearch}>
								<Ionicons
									name="close-circle"
									size={20}
									color={
										colorScheme === "dark"
											? colors.dark.mutedForeground
											: colors.light.mutedForeground
									}
								/>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Search Results */}
				<ScrollView className="flex-1">
					{loading ? (
						<View className="flex-1 items-center justify-center py-8">
							<ActivityIndicator size="large" />
						</View>
					) : searchResults.length > 0 ? (
						<View className="px-4 py-2">
							{searchResults.map((user) => (
								<TouchableOpacity
									key={user.id}
									onPress={() => handleUserPress(user)}
									className="flex-row items-center py-3"
								>
									<View className="w-12 h-12 rounded-full bg-muted mr-3 items-center justify-center">
										{user.avatar_url ? (
											<Image
												source={{ uri: user.avatar_url }}
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
									<View className="flex-1">
										<Text className="font-semibold text-base">
											{user.username}
										</Text>
										{user.full_name && (
											<Text className="text-muted-foreground text-sm">
												{user.full_name}
											</Text>
										)}
										<Text className="text-muted-foreground text-xs">
											{user.followers_count} followers
										</Text>
									</View>
								</TouchableOpacity>
							))}
						</View>
					) : searchQuery.length > 0 ? (
						<View className="flex-1 items-center justify-center py-8">
							<Text className="text-muted-foreground">No users found</Text>
						</View>
					) : (
						<View className="flex-1 items-center justify-center py-8">
							<View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
								<Ionicons
									name="search"
									size={32}
									color={
										colorScheme === "dark"
											? colors.dark.mutedForeground
											: colors.light.mutedForeground
									}
								/>
							</View>
							<Text className="text-xl font-bold mb-2">Discover People</Text>
							<Text className="text-muted-foreground text-center px-8">
								Search for friends and discover new accounts to follow
							</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
