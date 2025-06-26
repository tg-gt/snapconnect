import React, { useState, useEffect, useCallback } from "react";
import {
	FlatList,
	RefreshControl,
	View,
	ActivityIndicator,
} from "react-native";
import { PostCard } from "./PostCard";
import { Text } from "@/components/ui/text";
import { Post } from "@/lib/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface PostListProps {
	posts: Post[];
	loading?: boolean;
	refreshing?: boolean;
	hasMore?: boolean;
	onRefresh?: () => void;
	onLoadMore?: () => void;
	onLike?: (postId: string, isLiked: boolean) => void;
	onComment?: (postId: string) => void;
	onShare?: (postId: string) => void;
	onProfilePress?: (userId: string) => void;
	onMenu?: (postId: string) => void;
}

export function PostList({
	posts,
	loading = false,
	refreshing = false,
	hasMore = false,
	onRefresh,
	onLoadMore,
	onLike,
	onComment,
	onShare,
	onProfilePress,
	onMenu,
}: PostListProps) {
	const { colorScheme } = useColorScheme();

	const renderPost = useCallback(
		({ item }: { item: Post }) => (
			<PostCard
				key={item.id}
				post={item}
				onLike={(postId) => onLike?.(postId, item.is_liked || false)}
				onComment={onComment}
				onShare={onShare}
				onProfilePress={onProfilePress}
				onMenu={onMenu}
			/>
		),
		[onLike, onComment, onShare, onProfilePress, onMenu],
	);

	const renderFooter = () => {
		if (!loading || !hasMore) return null;

		return (
			<View className="py-6 items-center">
				<ActivityIndicator
					size="large"
					color={
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground
					}
				/>
			</View>
		);
	};

	const renderEmpty = () => {
		if (loading) return null;

		return (
			<View className="flex-1 items-center justify-center py-20">
				<Text className="text-muted-foreground text-center">
					No posts yet. Follow some users to see their posts here!
				</Text>
			</View>
		);
	};

	const handleEndReached = () => {
		if (hasMore && !loading) {
			onLoadMore?.();
		}
	};

	return (
		<FlatList
			data={posts}
			renderItem={renderPost}
			keyExtractor={(item) => item.id}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor={
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground
					}
				/>
			}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.3}
			ListFooterComponent={renderFooter}
			ListEmptyComponent={renderEmpty}
			removeClippedSubviews={true}
			maxToRenderPerBatch={5}
			windowSize={10}
			initialNumToRender={3}
		/>
	);
}
