import React, { useState, useEffect, useRef } from "react";
import {
	View,
	TouchableOpacity,
	Image,
	Text,
	StyleSheet,
	Dimensions,
	Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "@/components/safe-area-view";
import { Story } from "@/lib/types";
import { viewStory } from "@/lib/api";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StoryViewerProps {
	stories: Story[];
	initialIndex?: number;
	onClose: () => void;
	onUserProfile: (userId: string) => void;
}

export function StoryViewer({
	stories,
	initialIndex = 0,
	onClose,
	onUserProfile,
}: StoryViewerProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [progress, setProgress] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const progressAnimation = useRef(new Animated.Value(0)).current;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { colorScheme } = useColorScheme();

	const currentStory = stories[currentIndex];
	const isVideo = currentStory?.media_type === "video";
	const storyDuration = isVideo ? 15000 : 5000; // 15s for video, 5s for photo

	useEffect(() => {
		if (currentStory) {
			// Mark story as viewed
			viewStory(currentStory.id).catch(console.error);
		}
	}, [currentStory]);

	useEffect(() => {
		startProgress();
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [currentIndex, isPaused]);

	const startProgress = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		if (isPaused) return;

		progressAnimation.setValue(0);
		setProgress(0);

		Animated.timing(progressAnimation, {
			toValue: 1,
			duration: storyDuration,
			useNativeDriver: false,
		}).start(() => {
			nextStory();
		});

		// Update progress state for UI
		const startTime = Date.now();
		const updateProgress = () => {
			if (isPaused) return;
			
			const elapsed = Date.now() - startTime;
			const newProgress = Math.min(elapsed / storyDuration, 1);
			setProgress(newProgress);

			if (newProgress < 1) {
				timerRef.current = setTimeout(updateProgress, 50);
			}
		};
		updateProgress();
	};

	const nextStory = () => {
		if (currentIndex < stories.length - 1) {
			setCurrentIndex(currentIndex + 1);
		} else {
			onClose();
		}
	};

	const prevStory = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleTap = (event: any) => {
		const { locationX } = event.nativeEvent;
		const screenThird = screenWidth / 3;

		if (locationX < screenThird) {
			prevStory();
		} else if (locationX > screenThird * 2) {
			nextStory();
		} else {
			setIsPaused(!isPaused);
		}
	};



	if (!currentStory) return null;

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				{/* Progress bars */}
				<View style={styles.progressContainer}>
					{stories.map((_, index) => (
						<View key={index} style={styles.progressBarBackground}>
							<View
								style={[
									styles.progressBar,
									{
										width: `${
											index < currentIndex
												? 100
												: index === currentIndex
													? progress * 100
													: 0
										}%`,
									},
								]}
							/>
						</View>
					))}
				</View>

				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => onUserProfile(currentStory.user_id)}
						style={styles.userInfo}
					>
						<View style={styles.avatarContainer}>
							{currentStory.user?.avatar_url ? (
								<Image
									source={{ uri: currentStory.user.avatar_url }}
									style={styles.avatar}
								/>
							) : (
								<View style={styles.avatarPlaceholder}>
									<Ionicons name="person" size={16} color="white" />
								</View>
							)}
						</View>
						<Text style={styles.username}>
							{currentStory.user?.username || "Unknown"}
						</Text>
						<Text style={styles.timestamp}>
							{formatTimeAgo(currentStory.created_at)}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={onClose} style={styles.closeButton}>
						<Ionicons name="close" size={24} color="white" />
					</TouchableOpacity>
				</View>

				{/* Story Content */}
				<TouchableOpacity
					activeOpacity={1}
					onPress={handleTap}
					style={styles.storyContent}
				>
					{/* Tap zone indicators (subtle visual guides) */}
					<View style={styles.tapZones}>
						{currentIndex > 0 && (
							<View style={styles.leftTapZone}>
								<View style={styles.tapIndicator}>
									<Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.6)" />
								</View>
							</View>
						)}
						{currentIndex < stories.length - 1 && (
							<View style={styles.rightTapZone}>
								<View style={styles.tapIndicator}>
									<Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
								</View>
							</View>
						)}
					</View>

					{isVideo ? (
						<Video
							source={{ uri: currentStory.media_url }}
							style={styles.media}
							shouldPlay={!isPaused}
							isLooping={false}
							resizeMode={ResizeMode.CONTAIN}
						/>
					) : (
						<Image
							source={{ uri: currentStory.media_url }}
							style={styles.media}
							resizeMode="contain"
						/>
					)}

					{/* Pause indicator */}
					{isPaused && (
						<View style={styles.pauseOverlay}>
							<Ionicons name="pause" size={48} color="white" />
						</View>
					)}
				</TouchableOpacity>

				{/* Caption */}
				{currentStory.caption && (
					<View style={styles.captionContainer}>
						<Text style={styles.caption}>{currentStory.caption}</Text>
					</View>
				)}

				{/* Story actions */}
				<View style={styles.actions}>
					<TouchableOpacity style={styles.actionButton}>
						<Ionicons name="heart-outline" size={24} color="white" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionButton}>
						<Ionicons name="chatbubble-outline" size={24} color="white" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionButton}>
						<Ionicons name="paper-plane-outline" size={24} color="white" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
}

function formatTimeAgo(dateString: string): string {
	const now = new Date();
	const date = new Date(dateString);
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
	return `${Math.floor(diffInSeconds / 86400)}d`;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	safeArea: {
		flex: 1,
	},
	progressContainer: {
		flexDirection: "row",
		paddingHorizontal: 8,
		paddingTop: 8,
		gap: 4,
	},
	progressBarBackground: {
		flex: 1,
		height: 2,
		backgroundColor: "rgba(255,255,255,0.3)",
		borderRadius: 1,
	},
	progressBar: {
		height: "100%",
		backgroundColor: "white",
		borderRadius: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	avatarContainer: {
		marginRight: 8,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	avatarPlaceholder: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255,255,255,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	username: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
		marginRight: 8,
	},
	timestamp: {
		color: "rgba(255,255,255,0.7)",
		fontSize: 12,
	},
	closeButton: {
		padding: 8,
	},
	storyContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tapZones: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		flexDirection: "row",
		zIndex: 1,
	},
	leftTapZone: {
		width: screenWidth / 3,
		height: "100%",
		justifyContent: "center",
		alignItems: "flex-start",
		paddingLeft: 20,
	},
	rightTapZone: {
		position: "absolute",
		right: 0,
		width: screenWidth / 3,
		height: "100%",
		justifyContent: "center",
		alignItems: "flex-end",
		paddingRight: 20,
	},
	tapIndicator: {
		backgroundColor: "rgba(0,0,0,0.3)",
		borderRadius: 20,
		padding: 8,
	},
	media: {
		width: screenWidth,
		height: screenHeight * 0.7,
	},
	pauseOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.3)",
	},
	captionContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	caption: {
		color: "white",
		fontSize: 14,
		lineHeight: 20,
	},
	actions: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingBottom: 16,
		gap: 16,
	},
	actionButton: {
		padding: 8,
	},
}); 