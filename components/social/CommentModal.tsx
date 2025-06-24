import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Modal,
	TouchableOpacity,
	ScrollView,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Comment } from "@/lib/types";
import { getComments, createComment } from "@/lib/api";

interface CommentModalProps {
	visible: boolean;
	onClose: () => void;
	postId: string;
	onCommentAdded?: () => void;
}

export function CommentModal({
	visible,
	onClose,
	postId,
	onCommentAdded,
}: CommentModalProps) {
	const { colorScheme } = useColorScheme();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [loading, setLoading] = useState(false);
	const [posting, setPosting] = useState(false);

	const loadComments = useCallback(async () => {
		if (!postId) return;

		setLoading(true);
		try {
			const data = await getComments(postId);
			setComments(data);
		} catch (error) {
			console.error("Error loading comments:", error);
		} finally {
			setLoading(false);
		}
	}, [postId]);

	useEffect(() => {
		if (visible) {
			loadComments();
		}
	}, [visible, postId, loadComments]);

	const handleAddComment = async () => {
		if (!newComment.trim() || posting) return;

		setPosting(true);
		try {
			const comment = await createComment(postId, newComment.trim());
			setComments((prev) => [...prev, comment]);
			setNewComment("");
			onCommentAdded?.();
		} catch (error) {
			console.error("Error posting comment:", error);
		} finally {
			setPosting(false);
		}
	};

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInDays > 0) {
			return `${diffInDays}d`;
		} else if (diffInHours > 0) {
			return `${diffInHours}h`;
		} else {
			const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
			return `${diffInMinutes}m`;
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className={`flex-1 ${colorScheme === "dark" ? "bg-black" : "bg-white"}`}
			>
				{/* Header */}
				<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
					<Text className="text-lg font-semibold">Comments</Text>
					<TouchableOpacity onPress={onClose}>
						<Ionicons
							name="close"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
				</View>

				{/* Comments List */}
				<ScrollView className="flex-1 px-4">
					{loading ? (
						<View className="flex-1 items-center justify-center py-8">
							<ActivityIndicator size="large" />
						</View>
					) : comments.length === 0 ? (
						<View className="flex-1 items-center justify-center py-8">
							<Text className="text-muted-foreground">No comments yet</Text>
							<Text className="text-muted-foreground text-sm mt-1">
								Be the first to comment!
							</Text>
						</View>
					) : (
						<View className="py-4">
							{comments.map((comment) => (
								<View key={comment.id} className="flex-row mb-4">
									<View className="w-8 h-8 rounded-full bg-muted mr-3 items-center justify-center">
										{comment.user?.avatar_url ? (
											<Image
												source={{ uri: comment.user.avatar_url }}
												style={{ width: 32, height: 32, borderRadius: 16 }}
											/>
										) : (
											<Ionicons
												name="person"
												size={16}
												color={
													colorScheme === "dark"
														? colors.dark.mutedForeground
														: colors.light.mutedForeground
												}
											/>
										)}
									</View>
									<View className="flex-1">
										<View className="flex-row items-center mb-1">
											<Text className="font-semibold text-sm mr-2">
												{comment.user?.username || "Unknown"}
											</Text>
											<Text className="text-xs text-muted-foreground">
												{formatTimeAgo(comment.created_at)}
											</Text>
										</View>
										<Text className="text-sm leading-5">{comment.content}</Text>
									</View>
								</View>
							))}
						</View>
					)}
				</ScrollView>

				{/* Comment Input */}
				<View className="flex-row items-center px-4 py-3 border-t border-border">
					<TextInput
						value={newComment}
						onChangeText={setNewComment}
						placeholder="Add a comment..."
						placeholderTextColor={
							colorScheme === "dark"
								? colors.dark.mutedForeground
								: colors.light.mutedForeground
						}
						className={`flex-1 px-3 py-2 mr-3 rounded-full border border-border ${
							colorScheme === "dark" ? "text-white" : "text-black"
						}`}
						multiline
						maxLength={500}
					/>
					<TouchableOpacity
						onPress={handleAddComment}
						disabled={!newComment.trim() || posting}
						className={`px-4 py-2 rounded-full ${
							newComment.trim() && !posting ? "bg-blue-500" : "bg-muted"
						}`}
					>
						{posting ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text
								className={`font-semibold ${
									newComment.trim() && !posting
										? "text-white"
										: "text-muted-foreground"
								}`}
							>
								Post
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
