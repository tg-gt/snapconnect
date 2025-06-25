import React, { useState } from "react";
import { View, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { CameraCapture } from "@/components/create/CameraCapture";
import { PostEditor } from "@/components/create/PostEditor";
import { createPost, createStory } from "@/lib/api";

interface MediaItem {
	uri: string;
	type: "photo" | "video";
}

type CreateMode = "camera" | "post-editor" | "story-editor";

export default function CreateScreen() {
	const [mode, setMode] = useState<CreateMode>("camera");
	const [createType, setCreateType] = useState<"post" | "story">("post");
	const [capturedMedia, setCapturedMedia] = useState<MediaItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleMediaCaptured = (media: MediaItem) => {
		setCapturedMedia([media]);
		
		if (createType === "story") {
			// For stories, immediately proceed to story creation
			setMode("story-editor");
		} else {
			// For posts, go to post editor
			setMode("post-editor");
		}
	};

	const handleModeChange = (newMode: "post" | "story") => {
		setCreateType(newMode);
	};

	const handlePublishPost = async (data: {
		caption: string;
		location?: string;
		media: MediaItem[];
	}) => {
		try {
			setIsLoading(true);

			await createPost({
				caption: data.caption,
				location: data.location,
				media: data.media.map((item, index) => ({
					uri: item.uri,
					type: item.type,
					order_index: index,
				})),
			});

			Alert.alert(
				"Success",
				"Your post has been shared!",
				[
					{
						text: "OK",
						onPress: () => {
							// Navigate to home feed to see the new post
							router.replace("/(protected)/(tabs)/index");
						},
					},
				],
			);
		} catch (error) {
			console.error("Error creating post:", error);
			Alert.alert(
				"Error",
				"Failed to share your post. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePublishStory = async (caption?: string) => {
		if (capturedMedia.length === 0) return;

		try {
			setIsLoading(true);

			const media = capturedMedia[0];
			await createStory({
				media_url: media.uri,
				media_type: media.type,
				caption,
			});

			Alert.alert(
				"Success",
				"Your story has been shared!",
				[
					{
						text: "OK",
						onPress: () => {
							// Navigate to home feed to see stories
							router.replace("/(protected)/(tabs)/index");
						},
					},
				],
			);
		} catch (error) {
			console.error("Error creating story:", error);
			Alert.alert(
				"Error",
				"Failed to share your story. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		if (mode === "post-editor" || mode === "story-editor") {
			setMode("camera");
			setCapturedMedia([]);
		}
	};

	const handleClose = () => {
		// Navigate back to home tab
		router.replace("/(protected)/(tabs)/index");
	};

	// Camera mode
	if (mode === "camera") {
		return (
			<CameraCapture
				onMediaCaptured={handleMediaCaptured}
				onClose={handleClose}
				mode={createType}
				onModeChange={handleModeChange}
			/>
		);
	}

	// Post editor mode
	if (mode === "post-editor") {
		return (
			<PostEditor
				media={capturedMedia}
				onPublish={handlePublishPost}
				onBack={handleBack}
				isLoading={isLoading}
			/>
		);
	}

	// Story editor mode (simplified for now)
	if (mode === "story-editor") {
		return (
			<SafeAreaView className="flex-1 bg-black">
				<View className="flex-1">
					{/* Simple story editor - in a real app this would be more sophisticated */}
					<View className="flex-1 justify-center items-center px-4">
						<Text className="text-white text-lg mb-4">
							Share your story?
						</Text>
						<View className="flex-row space-x-4">
							<TouchableOpacity
								onPress={handleBack}
								className="bg-gray-600 px-6 py-3 rounded-lg"
							>
								<Text className="text-white font-semibold">Back</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handlePublishStory()}
								disabled={isLoading}
								className="bg-primary px-6 py-3 rounded-lg"
							>
								<Text className="text-white font-semibold">
									{isLoading ? "Sharing..." : "Share Story"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	return null;
}
