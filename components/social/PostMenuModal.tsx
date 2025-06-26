import React from "react";
import {
	Modal,
	View,
	TouchableOpacity,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Post } from "@/lib/types";

interface PostMenuModalProps {
	visible: boolean;
	onClose: () => void;
	post: Post | null;
	isOwnPost: boolean;
	onReport?: (postId: string) => void;
	onDelete?: (postId: string) => void;
	onEdit?: (postId: string) => void;
}

export function PostMenuModal({
	visible,
	onClose,
	post,
	isOwnPost,
	onReport,
	onDelete,
	onEdit,
}: PostMenuModalProps) {
	const { colorScheme } = useColorScheme();

	if (!post) return null;

	const handleReport = () => {
		onClose();
		Alert.alert(
			"Report Post",
			"Are you sure you want to report this post?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Report",
					style: "destructive",
					onPress: () => onReport?.(post.id),
				},
			],
		);
	};

	const handleDelete = () => {
		onClose();
		Alert.alert(
			"Delete Post",
			"Are you sure you want to delete this post? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => onDelete?.(post.id),
				},
			],
		);
	};

	const handleEdit = () => {
		onClose();
		onEdit?.(post.id);
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				className="flex-1 bg-black/50 justify-end"
				activeOpacity={1}
				onPress={onClose}
			>
				<View
					className={`mx-4 mb-8 rounded-xl overflow-hidden ${
						colorScheme === "dark" ? "bg-gray-800" : "bg-white"
					}`}
				>
					{isOwnPost ? (
						<>
							{/* Edit */}
							<TouchableOpacity
								onPress={handleEdit}
								className="flex-row items-center px-6 py-4 border-b border-border"
							>
								<Ionicons
									name="create-outline"
									size={24}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
									style={{ marginRight: 16 }}
								/>
								<Text className="text-lg">Edit</Text>
							</TouchableOpacity>

							{/* Delete */}
							<TouchableOpacity
								onPress={handleDelete}
								className="flex-row items-center px-6 py-4"
							>
								<Ionicons
									name="trash-outline"
									size={24}
									color="#FF3040"
									style={{ marginRight: 16 }}
								/>
								<Text className="text-lg text-red-500">Delete</Text>
							</TouchableOpacity>
						</>
					) : (
						/* Report */
						<TouchableOpacity
							onPress={handleReport}
							className="flex-row items-center px-6 py-4"
						>
							<Ionicons
								name="flag-outline"
								size={24}
								color="#FF3040"
								style={{ marginRight: 16 }}
							/>
							<Text className="text-lg text-red-500">Report</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Cancel */}
				<TouchableOpacity
					onPress={onClose}
					className={`mx-4 mb-8 rounded-xl px-6 py-4 items-center ${
						colorScheme === "dark" ? "bg-gray-800" : "bg-white"
					}`}
				>
					<Text className="text-lg font-semibold">Cancel</Text>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
} 