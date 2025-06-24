import React from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Post } from "@/lib/types";

interface PostGridProps {
	posts: Post[];
	onPostPress?: (post: Post) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const itemSize = (screenWidth - 6) / 3; // 3 columns with 2px spacing

export function PostGrid({ posts, onPostPress }: PostGridProps) {
	const { colorScheme } = useColorScheme();

	if (posts.length === 0) {
		return (
			<View className="flex-1 items-center justify-center py-12">
				<View className="w-16 h-16 rounded-full border-2 border-muted items-center justify-center mb-4">
					<Ionicons
						name="camera-outline"
						size={32}
						color={
							colorScheme === "dark"
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
				</View>
				<Text className="text-xl font-bold mb-2">No Posts Yet</Text>
				<Text className="text-muted-foreground text-center px-8">
					Share photos to see them on your profile
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1">
			{/* Tab selector */}
			<View className="flex-row border-t border-border">
				<TouchableOpacity className="flex-1 py-3 items-center border-b-2 border-foreground">
					<Ionicons
						name="grid-outline"
						size={20}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				</TouchableOpacity>
				<TouchableOpacity className="flex-1 py-3 items-center">
					<Ionicons
						name="person-outline"
						size={20}
						color={
							colorScheme === "dark"
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
					/>
				</TouchableOpacity>
			</View>

			{/* Posts grid */}
			<View className="flex-1 flex-row flex-wrap">
				{posts.map((post, index) => (
					<TouchableOpacity
						key={post.id}
						onPress={() => onPostPress?.(post)}
						style={{
							width: itemSize,
							height: itemSize,
							marginRight: index % 3 === 2 ? 0 : 2,
							marginBottom: 2,
						}}
					>
						<View className="relative w-full h-full">
							{post.media && post.media.length > 0 && (
								<Image
									source={{ uri: post.media[0].media_url }}
									style={{ width: "100%", height: "100%" }}
									contentFit="cover"
								/>
							)}

							{/* Multi-photo indicator */}
							{post.media && post.media.length > 1 && (
								<View className="absolute top-2 right-2">
									<Ionicons
										name="copy-outline"
										size={16}
										color="white"
										style={{
											textShadowColor: "rgba(0, 0, 0, 0.75)",
											textShadowOffset: { width: -1, height: 1 },
											textShadowRadius: 2,
										}}
									/>
								</View>
							)}

							{/* Video indicator */}
							{post.media && post.media[0]?.media_type === "video" && (
								<View className="absolute top-2 right-2">
									<Ionicons
										name="play"
										size={16}
										color="white"
										style={{
											textShadowColor: "rgba(0, 0, 0, 0.75)",
											textShadowOffset: { width: -1, height: 1 },
											textShadowRadius: 2,
										}}
									/>
								</View>
							)}

							{/* Engagement overlay for posts with high interaction */}
							{(post.likes_count > 0 || post.comments_count > 0) && (
								<View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
									<View className="flex-row space-x-3">
										{post.likes_count > 0 && (
											<View className="flex-row items-center">
												<Ionicons name="heart" size={12} color="white" />
												<Text className="text-white text-xs ml-1">
													{post.likes_count > 999 ? "999+" : post.likes_count}
												</Text>
											</View>
										)}
										{post.comments_count > 0 && (
											<View className="flex-row items-center">
												<Ionicons name="chatbubble" size={12} color="white" />
												<Text className="text-white text-xs ml-1">
													{post.comments_count > 999
														? "999+"
														: post.comments_count}
												</Text>
											</View>
										)}
									</View>
								</View>
							)}
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}
