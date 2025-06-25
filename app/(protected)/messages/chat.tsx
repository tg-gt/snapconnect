import React, { useState, useEffect, useRef } from "react";
import {
	View,
	FlatList,
	TextInput,
	TouchableOpacity,
	Image,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { getMessages, sendMessage, markMessagesAsRead, getCurrentUser } from "@/lib/api";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface Message {
	id: string;
	sender_id: string;
	content?: string;
	message_type: string;
	created_at: string;
	is_read: boolean;
	sender: {
		id: string;
		username: string;
		avatar_url?: string;
	};
	post?: {
		id: string;
		caption?: string;
		media: Array<{
			media_url: string;
			media_type: string;
		}>;
	};
}

export default function ChatScreen() {
	const { partnerId, partnerUsername } = useLocalSearchParams<{
		partnerId: string;
		partnerUsername: string;
	}>();
	
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const flatListRef = useRef<FlatList>(null);
	const { colorScheme } = useColorScheme();

	const loadMessages = async () => {
		try {
			const data = await getMessages(partnerId);
			setMessages(data.messages);
			// Mark messages as read
			await markMessagesAsRead(partnerId);
		} catch (error) {
			console.error("Error loading messages:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadCurrentUser = async () => {
		try {
			const user = await getCurrentUser();
			if (user) {
				setCurrentUserId(user.id);
			}
		} catch (error) {
			console.error("Error loading current user:", error);
		}
	};

	const handleSendMessage = async () => {
		if (!inputText.trim() || sending) return;

		const messageText = inputText.trim();
		setInputText("");
		setSending(true);

		try {
			const newMessage = await sendMessage({
				recipient_id: partnerId,
				content: messageText,
				message_type: "text",
			});

			setMessages(prev => [...prev, newMessage]);
			
			// Scroll to bottom
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		} catch (error) {
			console.error("Error sending message:", error);
			Alert.alert("Error", "Failed to send message. Please try again.");
			setInputText(messageText); // Restore the message
		} finally {
			setSending(false);
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const renderMessage = ({ item, index }: { item: Message; index: number }) => {
		const isOwnMessage = item.sender_id === currentUserId;
		const showAvatar = !isOwnMessage && (
			index === messages.length - 1 || 
			messages[index + 1]?.sender_id !== item.sender_id
		);

		return (
			<View className={`flex-row px-4 py-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
				{/* Avatar for other user */}
				{!isOwnMessage && (
					<View className="mr-2" style={{ width: 32 }}>
						{showAvatar && item.sender.avatar_url ? (
							<Image
								source={{ uri: item.sender.avatar_url }}
								style={{ width: 32, height: 32, borderRadius: 16 }}
							/>
						) : showAvatar ? (
							<View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
								<Ionicons name="person" size={16} color="gray" />
							</View>
						) : null}
					</View>
				)}

				{/* Message bubble */}
				<View
					className={`max-w-[70%] px-3 py-2 rounded-2xl ${
						isOwnMessage
							? 'bg-primary'
							: colorScheme === 'dark'
								? 'bg-gray-700'
								: 'bg-gray-200'
					}`}
					style={{
						borderBottomRightRadius: isOwnMessage ? 6 : 16,
						borderBottomLeftRadius: isOwnMessage ? 16 : 6,
					}}
				>
					{item.message_type === "post_share" && item.post ? (
						<View>
							<Text className={`text-sm ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
								Shared a post
							</Text>
							{item.post.media[0] && (
								<Image
									source={{ uri: item.post.media[0].media_url }}
									style={{ width: 150, height: 150, borderRadius: 8, marginTop: 4 }}
									resizeMode="cover"
								/>
							)}
							{item.post.caption && (
								<Text className={`text-xs mt-2 ${isOwnMessage ? 'text-white/80' : 'text-muted-foreground'}`}>
									{item.post.caption}
								</Text>
							)}
						</View>
					) : (
						<Text className={`text-base ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
							{item.content}
						</Text>
					)}
				</View>

				{/* Spacer for own messages */}
				{isOwnMessage && <View style={{ width: 32 }} />}
			</View>
		);
	};

	useEffect(() => {
		loadMessages();
		loadCurrentUser();
	}, [partnerId]);

	useEffect(() => {
		// Scroll to bottom when messages load
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: false });
			}, 100);
		}
	}, [messages.length]);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<KeyboardAvoidingView 
				style={{ flex: 1 }} 
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				{/* Header */}
				<View className="flex-row items-center px-4 py-3 border-b border-border">
					<TouchableOpacity onPress={() => router.back()} className="mr-3">
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
					<Text className="text-lg font-semibold flex-1">
						{partnerUsername}
					</Text>
					<TouchableOpacity>
						<Ionicons
							name="videocam-outline"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
				</View>

				{/* Messages */}
				<FlatList
					ref={flatListRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					className="flex-1"
					contentContainerStyle={{ paddingVertical: 8 }}
					showsVerticalScrollIndicator={false}
					onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
				/>

				{/* Input */}
				<View className="flex-row items-center px-4 py-3 border-t border-border">
					<TouchableOpacity className="mr-3">
						<Ionicons
							name="camera-outline"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</TouchableOpacity>
					
					<View className="flex-1 flex-row items-center border border-border rounded-full px-4 py-2">
						<TextInput
							value={inputText}
							onChangeText={setInputText}
							placeholder="Message..."
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
							multiline
							maxLength={1000}
							onSubmitEditing={handleSendMessage}
							blurOnSubmit={false}
						/>
						{inputText.trim() && (
							<TouchableOpacity
								onPress={handleSendMessage}
								disabled={sending}
								className="ml-2"
							>
								<Ionicons
									name="send"
									size={20}
									color={sending ? "gray" : "#007AFF"}
								/>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
} 