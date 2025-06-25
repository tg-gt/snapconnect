import React, { useState, useEffect } from "react";
import {
	View,
	FlatList,
	TouchableOpacity,
	Image,
	RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { getConversations } from "@/lib/api";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface Conversation {
	partner: {
		id: string;
		username: string;
		full_name?: string;
		avatar_url?: string;
	};
	lastMessage: {
		id: string;
		content?: string;
		message_type: string;
		created_at: string;
		sender_id: string;
	};
	unreadCount: number;
}

export default function MessagesScreen() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const { colorScheme } = useColorScheme();

	const loadConversations = async () => {
		try {
			const data = await getConversations();
			setConversations(data);
		} catch (error) {
			console.error("Error loading conversations:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadConversations();
		setRefreshing(false);
	};

	const handleConversationPress = (partnerId: string, partnerUsername: string) => {
		router.push({
			pathname: "/(protected)/messages/chat",
			params: { partnerId, partnerUsername },
		});
	};

	const formatLastMessage = (message: Conversation["lastMessage"]) => {
		if (message.message_type === "post_share") {
			return "Shared a post";
		}
		if (message.message_type === "media") {
			return "Sent a photo";
		}
		return message.content || "Message";
	};

	const formatTime = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else if (diffInHours < 168) { // 7 days
			return date.toLocaleDateString([], { weekday: 'short' });
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
		}
	};

	const renderConversation = ({ item }: { item: Conversation }) => (
		<TouchableOpacity
			onPress={() => handleConversationPress(item.partner.id, item.partner.username)}
			className="flex-row items-center px-4 py-3 border-b border-border"
		>
			{/* Avatar */}
			<View className="mr-3">
				{item.partner.avatar_url ? (
					<Image
						source={{ uri: item.partner.avatar_url }}
						style={{ width: 56, height: 56, borderRadius: 28 }}
					/>
				) : (
					<View className="w-14 h-14 rounded-full bg-muted items-center justify-center">
						<Ionicons
							name="person"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
						/>
					</View>
				)}
				{item.unreadCount > 0 && (
					<View className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full items-center justify-center">
						<Text className="text-white text-xs font-bold">
							{item.unreadCount > 9 ? "9+" : item.unreadCount}
						</Text>
					</View>
				)}
			</View>

			{/* Content */}
			<View className="flex-1">
				<View className="flex-row items-center justify-between mb-1">
					<Text className="font-semibold text-base">
						{item.partner.full_name || item.partner.username}
					</Text>
					<Text className="text-muted-foreground text-sm">
						{formatTime(item.lastMessage.created_at)}
					</Text>
				</View>
				<Text
					className={`text-sm ${
						item.unreadCount > 0 ? "font-medium" : "text-muted-foreground"
					}`}
					numberOfLines={1}
				>
					{formatLastMessage(item.lastMessage)}
				</Text>
			</View>

			{/* Chevron */}
			<Ionicons
				name="chevron-forward"
				size={20}
				color={
					colorScheme === "dark"
						? colors.dark.mutedForeground
						: colors.light.mutedForeground
				}
				style={{ marginLeft: 8 }}
			/>
		</TouchableOpacity>
	);

	useEffect(() => {
		loadConversations();
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
				<TouchableOpacity onPress={() => router.back()}>
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
				<Text className="text-xl font-bold">Messages</Text>
				<TouchableOpacity>
					<Ionicons
						name="create-outline"
						size={24}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				</TouchableOpacity>
			</View>

			{/* Conversations List */}
			<FlatList
				data={conversations}
				renderItem={renderConversation}
				keyExtractor={(item) => item.partner.id}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				}
				ListEmptyComponent={
					<View className="flex-1 items-center justify-center py-20">
						<Ionicons
							name="chatbubbles-outline"
							size={48}
							color={
								colorScheme === "dark"
									? colors.dark.mutedForeground
									: colors.light.mutedForeground
							}
						/>
						<Text className="text-muted-foreground text-center mt-4">
							No messages yet
						</Text>
						<Text className="text-muted-foreground text-center mt-2">
							Start a conversation with someone!
						</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
} 