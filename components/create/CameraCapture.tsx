import React, { useState, useRef, useEffect } from "react";
import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
	Alert,
	Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CameraCaptureProps {
	onMediaCaptured: (media: {
		uri: string;
		type: "photo" | "video";
	}) => void;
	onClose: () => void;
	mode: "post" | "story";
	onModeChange: (mode: "post" | "story") => void;
}

export function CameraCapture({
	onMediaCaptured,
	onClose,
	mode,
	onModeChange,
}: CameraCaptureProps) {
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [mediaLibraryPermission, requestMediaLibraryPermission] =
		MediaLibrary.usePermissions();
	const [facing, setFacing] = useState<CameraType>("back");
	const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
	const [isRecording, setIsRecording] = useState(false);
	const cameraRef = useRef<CameraView>(null);
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		(async () => {
			if (!cameraPermission?.granted) {
				await requestCameraPermission();
			}
			if (!mediaLibraryPermission?.granted) {
				await requestMediaLibraryPermission();
			}
		})();
	}, []);

	const toggleCameraFacing = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const toggleFlash = () => {
		setFlash((current) => {
			switch (current) {
				case "off":
					return "on";
				case "on":
					return "auto";
				default:
					return "off";
			}
		});
	};

	const takePicture = async () => {
		if (!cameraRef.current) return;

		try {
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.8,
				base64: false,
			});

			if (photo) {
				onMediaCaptured({
					uri: photo.uri,
					type: "photo",
				});
			}
		} catch (error) {
			console.error("Error taking picture:", error);
			Alert.alert("Error", "Failed to take picture");
		}
	};

	const startRecording = async () => {
		if (!cameraRef.current || isRecording) return;

		try {
			setIsRecording(true);
			const video = await cameraRef.current.recordAsync({
				maxDuration: mode === "story" ? 15 : 60, // 15s for stories, 60s for posts
			});

			if (video) {
				onMediaCaptured({
					uri: video.uri,
					type: "video",
				});
			}
		} catch (error) {
			console.error("Error recording video:", error);
			Alert.alert("Error", "Failed to record video");
		} finally {
			setIsRecording(false);
		}
	};

	const stopRecording = () => {
		if (cameraRef.current && isRecording) {
			cameraRef.current.stopRecording();
		}
	};

	const pickFromGallery = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsEditing: true,
				aspect: mode === "story" ? [9, 16] : [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0];
				onMediaCaptured({
					uri: asset.uri,
					type: asset.type === "video" ? "video" : "photo",
				});
			}
		} catch (error) {
			console.error("Error picking from gallery:", error);
			Alert.alert("Error", "Failed to access gallery");
		}
	};

	if (!cameraPermission?.granted) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>
					Camera permission is required to take photos and videos.
				</Text>
				<TouchableOpacity
					style={styles.permissionButton}
					onPress={requestCameraPermission}
				>
					<Text style={styles.permissionButtonText}>Grant Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={styles.camera}
				facing={facing}
				flash={flash}
				ref={cameraRef}
			>
				{/* Header Controls */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.headerButton}>
						<Ionicons name="close" size={24} color="white" />
					</TouchableOpacity>

					<View style={styles.headerCenter}>
						{/* Flash control */}
						<TouchableOpacity onPress={toggleFlash} style={styles.headerButton}>
							<Ionicons
								name={
									flash === "off"
										? "flash-off"
										: flash === "on"
											? "flash"
											: "flash-outline"
								}
								size={24}
								color="white"
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={toggleCameraFacing}
						style={styles.headerButton}
					>
						<Ionicons name="camera-reverse" size={24} color="white" />
					</TouchableOpacity>
				</View>

				{/* Mode Toggle */}
				<View style={styles.modeToggle}>
					<TouchableOpacity
						onPress={() => onModeChange("story")}
						style={[
							styles.modeButton,
							mode === "story" && styles.modeButtonActive,
						]}
					>
						<Text
							style={[
								styles.modeText,
								mode === "story" && styles.modeTextActive,
							]}
						>
							Story
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => onModeChange("post")}
						style={[
							styles.modeButton,
							mode === "post" && styles.modeButtonActive,
						]}
					>
						<Text
							style={[
								styles.modeText,
								mode === "post" && styles.modeTextActive,
							]}
						>
							Post
						</Text>
					</TouchableOpacity>
				</View>

				{/* Bottom Controls */}
				<View style={styles.bottomControls}>
					<TouchableOpacity onPress={pickFromGallery} style={styles.galleryButton}>
						<Ionicons name="images" size={24} color="white" />
					</TouchableOpacity>

					{/* Capture Button */}
					<TouchableOpacity
						onPress={takePicture}
						onLongPress={startRecording}
						onPressOut={stopRecording}
						style={[
							styles.captureButton,
							isRecording && styles.captureButtonRecording,
						]}
					>
						<View
							style={[
								styles.captureButtonInner,
								isRecording && styles.captureButtonInnerRecording,
							]}
						/>
					</TouchableOpacity>

					{/* Empty space for balance */}
					<View style={styles.galleryButton} />
				</View>

				{/* Recording indicator */}
				{isRecording && (
					<View style={styles.recordingIndicator}>
						<View style={styles.recordingDot} />
						<Text style={styles.recordingText}>Recording...</Text>
					</View>
				)}
			</CameraView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	camera: {
		flex: 1,
	},
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "black",
		padding: 20,
	},
	permissionText: {
		color: "white",
		textAlign: "center",
		marginBottom: 20,
		fontSize: 16,
	},
	permissionButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	permissionButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 60,
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	headerButton: {
		padding: 8,
	},
	headerCenter: {
		flexDirection: "row",
		alignItems: "center",
	},
	modeToggle: {
		position: "absolute",
		top: 120,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	modeButton: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		marginHorizontal: 10,
		borderRadius: 20,
		backgroundColor: "rgba(0,0,0,0.3)",
	},
	modeButtonActive: {
		backgroundColor: "white",
	},
	modeText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	modeTextActive: {
		color: "black",
	},
	bottomControls: {
		position: "absolute",
		bottom: 50,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	galleryButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "white",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		borderColor: "rgba(255,255,255,0.3)",
	},
	captureButtonRecording: {
		borderColor: "#FF3040",
	},
	captureButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "white",
	},
	captureButtonInnerRecording: {
		borderRadius: 8,
		backgroundColor: "#FF3040",
	},
	recordingIndicator: {
		position: "absolute",
		top: 180,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	recordingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#FF3040",
		marginRight: 8,
	},
	recordingText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
}); 