import React, { useState } from "react";
import {
	View,
	TouchableOpacity,
	TextInput,
	Image,
	ScrollView,
	Alert,
	Dimensions,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

const { width: screenWidth } = Dimensions.get("window");

interface MediaItem {
	uri: string;
	type: "photo" | "video";
}

interface PostEditorProps {
	media: MediaItem[];
	onPublish: (data: {
		caption: string;
		location?: string;
		media: MediaItem[];
	}) => void;
	onBack: () => void;
	isLoading?: boolean;
}

export function PostEditor({
	media,
	onPublish,
	onBack,
	isLoading = false,
}: PostEditorProps) {
	const [caption, setCaption] = useState("");
	const [location, setLocation] = useState("");
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const { colorScheme } = useColorScheme();

	const handlePublish = () => {
		if (media.length === 0) {
			Alert.alert("Error", "Please select at least one photo or video");
			return;
		}

		onPublish({
			caption: caption.trim(),
			location: location.trim() || undefined,
			media,
		});
	};

	const detectHashtags = (text: string) => {
		const hashtagRegex = /#[\w]+/g;
		return text.match(hashtagRegex) || [];
	};

	const hashtags = detectHashtags(caption);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
				<TouchableOpacity onPress={onBack}>
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
				<Text className="text-lg font-semibold">New Post</Text>
				<Button
					onPress={handlePublish}
					disabled={isLoading}
					className="px-4 py-2"
				>
					<Text className="text-primary-foreground font-semibold">
						{isLoading ? "Sharing..." : "Share"}
					</Text>
				</Button>
			</View>

			<ScrollView className="flex-1">
				{/* Media Preview */}
				<View className="relative">
					<Image
						source={{ uri: media[currentMediaIndex]?.uri }}
						style={{
							width: screenWidth,
							height: screenWidth,
							backgroundColor:
								colorScheme === "dark" ? colors.dark.muted : colors.light.muted,
						}}
						resizeMode="cover"
					/>

					{/* Media indicators */}
					{media.length > 1 && (
						<>
							<View className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded-full">
								<Text className="text-white text-xs">
									{currentMediaIndex + 1}/{media.length}
								</Text>
							</View>

							{/* Navigation dots */}
							<View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center space-x-2">
								{media.map((_, index) => (
									<TouchableOpacity
										key={index}
										onPress={() => setCurrentMediaIndex(index)}
										className={`w-2 h-2 rounded-full ${
											index === currentMediaIndex
												? "bg-white"
												: "bg-white/50"
										}`}
									/>
								))}
							</View>
						</>
					)}

					{/* Video indicator */}
					{media[currentMediaIndex]?.type === "video" && (
						<View className="absolute top-3 right-3">
							<Ionicons name="play" size={20} color="white" />
						</View>
					)}
				</View>

				{/* Content Form */}
				<View className="p-4 space-y-4">
					{/* Caption Input */}
					<View>
						<Text className="text-sm font-medium mb-2">Caption</Text>
						<TextInput
							value={caption}
							onChangeText={setCaption}
							placeholder="Write a caption..."
							placeholderTextColor={
								colorScheme === "dark"
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
							multiline
							numberOfLines={4}
							maxLength={2200}
							className="border border-border rounded-lg p-3 text-foreground"
							style={{
								color:
									colorScheme === "dark"
										? colors.dark.foreground
										: colors.light.foreground,
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
								minHeight: 100,
								textAlignVertical: "top",
							}}
						/>
						<View className="flex-row justify-between items-center mt-1">
							<Text className="text-xs text-muted-foreground">
								{hashtags.length > 0 && `${hashtags.length} hashtags`}
							</Text>
							<Text className="text-xs text-muted-foreground">
								{caption.length}/2200
							</Text>
						</View>
					</View>

					{/* Location Input */}
					<View>
						<Text className="text-sm font-medium mb-2">Location</Text>
						<View className="flex-row items-center border border-border rounded-lg px-3 py-2">
							<Ionicons
								name="location-outline"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
								style={{ marginRight: 8 }}
							/>
							<TextInput
								value={location}
								onChangeText={setLocation}
								placeholder="Add location"
								placeholderTextColor={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
								className="flex-1 text-foreground"
								style={{
									color:
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground,
								}}
							/>
						</View>
					</View>

					{/* Hashtag Suggestions */}
					{hashtags.length > 0 && (
						<View>
							<Text className="text-sm font-medium mb-2">Hashtags</Text>
							<View className="flex-row flex-wrap gap-2">
								{hashtags.map((hashtag, index) => (
									<View
										key={index}
										className="bg-primary/10 px-3 py-1 rounded-full"
									>
										<Text className="text-primary text-sm">{hashtag}</Text>
									</View>
								))}
							</View>
						</View>
					)}

					{/* Media Grid for multiple items */}
					{media.length > 1 && (
						<View>
							<Text className="text-sm font-medium mb-2">
								Media ({media.length})
							</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View className="flex-row space-x-2">
									{media.map((item, index) => (
										<TouchableOpacity
											key={index}
											onPress={() => setCurrentMediaIndex(index)}
											className={`relative ${
												index === currentMediaIndex
													? "border-2 border-primary rounded-lg"
													: ""
											}`}
										>
											<Image
												source={{ uri: item.uri }}
												style={{
													width: 80,
													height: 80,
													borderRadius: 8,
												}}
												resizeMode="cover"
											/>
											{item.type === "video" && (
												<View className="absolute top-1 right-1">
													<Ionicons name="play" size={12} color="white" />
												</View>
											)}
										</TouchableOpacity>
									))}
								</View>
							</ScrollView>
						</View>
					)}

					{/* Additional Options */}
					<View className="space-y-3 pt-4 border-t border-border">
						<TouchableOpacity className="flex-row items-center justify-between py-2">
							<View className="flex-row items-center">
								<Ionicons
									name="people-outline"
									size={20}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
									style={{ marginRight: 12 }}
								/>
								<Text className="text-foreground">Tag People</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
							/>
						</TouchableOpacity>

						<TouchableOpacity className="flex-row items-center justify-between py-2">
							<View className="flex-row items-center">
								<Ionicons
									name="musical-notes-outline"
									size={20}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
									style={{ marginRight: 12 }}
								/>
								<Text className="text-foreground">Add Music</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
							/>
						</TouchableOpacity>

						<TouchableOpacity className="flex-row items-center justify-between py-2">
							<View className="flex-row items-center">
								<Ionicons
									name="settings-outline"
									size={20}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
									style={{ marginRight: 12 }}
								/>
								<Text className="text-foreground">Advanced Settings</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 