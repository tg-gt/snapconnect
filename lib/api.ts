import { supabase } from "@/config/supabase";
import {
	Post,
	User,
	FeedResponse,
	CreatePostData,
	Comment,
	Activity,
	UpdateProfileData,
} from "@/lib/types";

// Posts API
export async function getFeed(
	cursor?: string,
	limit = 10,
): Promise<FeedResponse> {
	try {
		let query = supabase
			.from("posts")
			.select(
				`
				*,
				user:users!posts_user_id_fkey(
					id, username, full_name, avatar_url
				),
				media:post_media(*)
			`,
			)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (cursor) {
			query = query.lt("created_at", cursor);
		}

		const { data: posts, error } = await query;

		if (error) throw error;

		// Get current user to check likes
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		// Check which posts are liked by current user
		let likedPostIds: string[] = [];
		if (currentUser && posts?.length) {
			const { data: likes } = await supabase
				.from("likes")
				.select("post_id")
				.eq("user_id", currentUser.id)
				.in(
					"post_id",
					posts.map((p) => p.id),
				);

			likedPostIds = likes?.map((l) => l.post_id) || [];
		}

		const processedPosts =
			posts?.map((post) => ({
				...post,
				is_liked: likedPostIds.includes(post.id),
			})) || [];

		return {
			posts: processedPosts,
			has_more: posts?.length === limit,
			next_cursor:
				posts?.length === limit
					? posts[posts.length - 1].created_at
					: undefined,
		};
	} catch (error) {
		console.error("Error fetching feed:", error);
		throw error;
	}
}

// Simplified post creation (without file upload for now)
export async function createPost(postData: CreatePostData): Promise<Post> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		// Create post
		const { data: post, error: postError } = await supabase
			.from("posts")
			.insert({
				user_id: user.id,
				caption: postData.caption,
				location: postData.location,
			})
			.select()
			.single();

		if (postError) throw postError;

		// Create media records (using URIs directly for now)
		const mediaRecords = [];
		for (let i = 0; i < postData.media.length; i++) {
			const media = postData.media[i];
			const { data: mediaRecord, error: mediaError } = await supabase
				.from("post_media")
				.insert({
					post_id: post.id,
					media_url: media.uri, // Using URI directly for now
					media_type: media.type,
					order_index: i,
				})
				.select()
				.single();

			if (mediaError) throw mediaError;
			mediaRecords.push(mediaRecord);
		}

		return {
			...post,
			media: mediaRecords,
		};
	} catch (error) {
		console.error("Error creating post:", error);
		throw error;
	}
}

export async function likePost(postId: string): Promise<void> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		// Insert like
		const { error } = await supabase.from("likes").insert({
			user_id: user.id,
			post_id: postId,
		});

		if (error) throw error;

		// Get current likes count and increment
		const { data: post } = await supabase
			.from("posts")
			.select("likes_count")
			.eq("id", postId)
			.single();

		if (post) {
			await supabase
				.from("posts")
				.update({ likes_count: post.likes_count + 1 })
				.eq("id", postId);
		}
	} catch (error) {
		console.error("Error liking post:", error);
		throw error;
	}
}

export async function unlikePost(postId: string): Promise<void> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		// Delete like
		const { error } = await supabase
			.from("likes")
			.delete()
			.eq("user_id", user.id)
			.eq("post_id", postId);

		if (error) throw error;

		// Get current likes count and decrement
		const { data: post } = await supabase
			.from("posts")
			.select("likes_count")
			.eq("id", postId)
			.single();

		if (post && post.likes_count > 0) {
			await supabase
				.from("posts")
				.update({ likes_count: post.likes_count - 1 })
				.eq("id", postId);
		}
	} catch (error) {
		console.error("Error unliking post:", error);
		throw error;
	}
}

export async function getComments(postId: string): Promise<Comment[]> {
	try {
		const { data, error } = await supabase
			.from("comments")
			.select(
				`
				*,
				user:users!comments_user_id_fkey(
					id, username, full_name, avatar_url
				)
			`,
			)
			.eq("post_id", postId)
			.order("created_at", { ascending: true });

		if (error) throw error;

		return data || [];
	} catch (error) {
		console.error("Error fetching comments:", error);
		throw error;
	}
}

export async function createComment(
	postId: string,
	content: string,
): Promise<Comment> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data: comment, error } = await supabase
			.from("comments")
			.insert({
				user_id: user.id,
				post_id: postId,
				content,
			})
			.select(
				`
				*,
				user:users!comments_user_id_fkey(
					id, username, full_name, avatar_url
				)
			`,
			)
			.single();

		if (error) throw error;

		// Update comments count
		const { data: post } = await supabase
			.from("posts")
			.select("comments_count")
			.eq("id", postId)
			.single();

		if (post) {
			await supabase
				.from("posts")
				.update({ comments_count: post.comments_count + 1 })
				.eq("id", postId);
		}

		return comment;
	} catch (error) {
		console.error("Error creating comment:", error);
		throw error;
	}
}

// User API
export async function getCurrentUser(): Promise<User | null> {
	try {
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();
		if (!authUser) return null;

		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", authUser.id)
			.single();

		if (error) throw error;

		return user;
	} catch (error) {
		console.error("Error fetching current user:", error);
		return null;
	}
}

export async function createUserProfile(userData: {
	email: string;
	username: string;
	full_name?: string;
}): Promise<User> {
	try {
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();
		if (!authUser) throw new Error("User not authenticated");

		const { data: user, error } = await supabase
			.from("users")
			.insert({
				id: authUser.id,
				email: userData.email,
				username: userData.username,
				full_name: userData.full_name,
			})
			.select()
			.single();

		if (error) throw error;

		return user;
	} catch (error) {
		console.error("Error creating user profile:", error);
		throw error;
	}
}

// Follow system
export async function followUser(userId: string): Promise<void> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { error } = await supabase.from("follows").insert({
			follower_id: user.id,
			following_id: userId,
		});

		if (error) throw error;

		// Update counts manually
		const [currentUserData, targetUserData] = await Promise.all([
			supabase
				.from("users")
				.select("following_count")
				.eq("id", user.id)
				.single(),
			supabase
				.from("users")
				.select("followers_count")
				.eq("id", userId)
				.single(),
		]);

		await Promise.all([
			supabase
				.from("users")
				.update({
					following_count: (currentUserData.data?.following_count || 0) + 1,
				})
				.eq("id", user.id),
			supabase
				.from("users")
				.update({
					followers_count: (targetUserData.data?.followers_count || 0) + 1,
				})
				.eq("id", userId),
		]);
	} catch (error) {
		console.error("Error following user:", error);
		throw error;
	}
}

export async function unfollowUser(userId: string): Promise<void> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { error } = await supabase
			.from("follows")
			.delete()
			.eq("follower_id", user.id)
			.eq("following_id", userId);

		if (error) throw error;

		// Update counts manually
		const [currentUserData, targetUserData] = await Promise.all([
			supabase
				.from("users")
				.select("following_count")
				.eq("id", user.id)
				.single(),
			supabase
				.from("users")
				.select("followers_count")
				.eq("id", userId)
				.single(),
		]);

		await Promise.all([
			supabase
				.from("users")
				.update({
					following_count: Math.max(
						0,
						(currentUserData.data?.following_count || 0) - 1,
					),
				})
				.eq("id", user.id),
			supabase
				.from("users")
				.update({
					followers_count: Math.max(
						0,
						(targetUserData.data?.followers_count || 0) - 1,
					),
				})
				.eq("id", userId),
		]);
	} catch (error) {
		console.error("Error unfollowing user:", error);
		throw error;
	}
}

// Get user profile with posts
export async function getUserProfile(
	userId: string,
): Promise<User & { posts: Post[]; is_following?: boolean }> {
	try {
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();

		// Get user data
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (userError) throw userError;

		// Get user's posts
		const { data: posts, error: postsError } = await supabase
			.from("posts")
			.select(
				`
				*,
				user:users!posts_user_id_fkey(
					id, username, full_name, avatar_url
				),
				media:post_media(*)
			`,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (postsError) throw postsError;

		// Check if current user is following this user
		let isFollowing = false;
		if (currentUser && currentUser.id !== userId) {
			const { data: followData } = await supabase
				.from("follows")
				.select("id")
				.eq("follower_id", currentUser.id)
				.eq("following_id", userId)
				.single();

			isFollowing = !!followData;
		}

		return {
			...user,
			posts: posts || [],
			is_following: isFollowing,
		};
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
}

// Search users
export async function searchUsers(query: string): Promise<User[]> {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
			.limit(20);

		if (error) throw error;

		return data || [];
	} catch (error) {
		console.error("Error searching users:", error);
		throw error;
	}
}

// Get activities (notifications)
export async function getActivities(): Promise<Activity[]> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("activities")
			.select(
				`
				*,
				actor:users!activities_actor_id_fkey(
					id, username, full_name, avatar_url
				),
				post:posts(
					id, media:post_media(media_url, media_type)
				),
				comment:comments(
					id, content
				)
			`,
			)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(50);

		if (error) throw error;

		return data || [];
	} catch (error) {
		console.error("Error fetching activities:", error);
		throw error;
	}
}

// Mark activities as read
export async function markActivitiesAsRead(
	activityIds: string[],
): Promise<void> {
	try {
		const { error } = await supabase
			.from("activities")
			.update({ is_read: true })
			.in("id", activityIds);

		if (error) throw error;
	} catch (error) {
		console.error("Error marking activities as read:", error);
		throw error;
	}
}

// Update user profile
export async function updateUserProfile(
	updates: UpdateProfileData,
): Promise<User> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("users")
			.update(updates)
			.eq("id", user.id)
			.select()
			.single();

		if (error) throw error;

		return data;
	} catch (error) {
		console.error("Error updating profile:", error);
		throw error;
	}
}
