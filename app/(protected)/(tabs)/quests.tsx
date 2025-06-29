import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { QuestCard } from "@/components/quests/QuestCard";
import { getEventQuests } from "@/lib/api";
import { Quest, QuestProgress as QuestProgressType, DEMO_EVENT_CONTEXT } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { getQuestCompletions, getUserPoints } from "@/lib/storage";

export default function QuestsScreen() {
	const [quests, setQuests] = useState<Quest[]>([]);
	const [questProgresses, setQuestProgresses] = useState<QuestProgressType[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<'all' | 'location' | 'social' | 'photo'>('all');

	// Load demo quests
	const loadQuests = useCallback(async () => {
		try {
			setLoading(true);
			
			// Mock quest data - in real app, this would come from API
			const mockQuests: Quest[] = [
				{
					id: 'quest-1',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Find the Main Stage',
					description: 'Navigate to the main stage and take a photo of the stage setup. This quest will help you get familiar with the venue layout.',
					quest_type: 'location',
					points_reward: 50,
					location_latitude: 37.7749,
					location_longitude: -122.4194,
					location_radius_meters: 100,
					required_photo: true,
					is_active: true,
					order_index: 1,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-2',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Meet 3 New People',
					description: 'Start conversations with 3 new attendees and take a group photo together. This is a great way to network and make new connections.',
					quest_type: 'social',
					points_reward: 75,
					location_radius_meters: 0,
					required_photo: true,
					is_active: true,
					order_index: 2,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-3',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Food Truck Adventure',
					description: 'Visit the food truck area and try something new. Perfect for exploring the local cuisine!',
					quest_type: 'location',
					points_reward: 30,
					location_latitude: 37.7751,
					location_longitude: -122.4180,
					location_radius_meters: 50,
					required_photo: false,
					is_active: true,
					order_index: 3,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-4',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Capture the Sunset',
					description: 'Take a stunning photo of the sunset from the venue. Golden hour photography quest!',
					quest_type: 'photo',
					points_reward: 40,
					location_radius_meters: 0,
					required_photo: true,
					is_active: true,
					order_index: 4,
					created_at: new Date().toISOString(),
				},
				{
					id: 'quest-5',
					event_id: DEMO_EVENT_CONTEXT.eventId,
					title: 'Discover Hidden Art',
					description: 'Find and photograph the hidden art installation somewhere in the venue.',
					quest_type: 'photo',
					points_reward: 60,
					location_latitude: 37.7748,
					location_longitude: -122.4196,
					location_radius_meters: 75,
					required_photo: true,
					is_active: true,
					order_index: 5,
					created_at: new Date().toISOString(),
				},
			];

			setQuests(mockQuests);

			// Get completed quests from storage
			const completedQuests = await getQuestCompletions();
			const completedQuestIds = completedQuests.map(c => c.questId);

			// Initialize quest progress with completion status
			const mockProgresses: QuestProgressType[] = mockQuests.map((quest, index) => {
				const isCompleted = completedQuestIds.includes(quest.id);
				const completion = completedQuests.find(c => c.questId === quest.id);
				
				return {
					quest,
					is_in_range: false,
					can_complete: false,
					progress_percentage: isCompleted ? 100 : (index === 0 ? 75 : index === 1 ? 50 : 10),
					distance_to_location: undefined,
					completion: isCompleted ? {
						id: 'completion-' + quest.id,
						quest_id: quest.id,
						participant_id: DEMO_EVENT_CONTEXT.participantId,
						points_earned: completion?.pointsEarned || quest.points_reward,
						completed_at: completion?.completedAt || new Date().toISOString(),
						verified: true,
					} : undefined,
				};
			});

			setQuestProgresses(mockProgresses);
		} catch (error) {
			console.error("Error loading quests:", error);
			Alert.alert("Error", "Failed to load quests. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadQuests();
	}, [loadQuests]);

	// Quest handlers
	const handleQuestPress = useCallback((questId: string) => {
		router.push({
			pathname: '/(protected)/quest-detail',
			params: { questId },
		});
	}, []);

	const handleQuestComplete = useCallback(async (questId: string) => {
		try {
			// Find the quest progress
			const questProgress = questProgresses.find(qp => qp.quest.id === questId);
			if (!questProgress?.can_complete) {
				Alert.alert('Cannot Complete', 'Quest requirements not met yet!');
				return;
			}

			// Navigate to quest detail for completion
			handleQuestPress(questId);
		} catch (error) {
			console.error('Error handling quest completion:', error);
		}
	}, [questProgresses, handleQuestPress]);

	// Filter quests by category
	const filteredQuests = questProgresses.filter(qp => {
		if (selectedCategory === 'all') return true;
		return qp.quest.quest_type === selectedCategory;
	});

	// Stats state
	const [totalPoints, setTotalPoints] = useState(0);
	
	// Load real points from storage
	useEffect(() => {
		getUserPoints().then(points => setTotalPoints(points));
	}, [questProgresses]);
	
	// Calculate stats
	const totalQuests = questProgresses.length;
	const completedQuests = questProgresses.filter(qp => qp.completion?.verified).length;

	const getQuestTypeIcon = (type: string) => {
		switch (type) {
			case 'location': return 'location';
			case 'social': return 'people';
			case 'photo': return 'camera';
			default: return 'trophy';
		}
	};

	const getQuestTypeLabel = (type: string) => {
		switch (type) {
			case 'location': return 'Location';
			case 'social': return 'Social';
			case 'photo': return 'Photo';
			default: return 'All';
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="px-4 py-3 border-b border-border">
				<View className="flex-row items-center justify-between">
					<Text className="text-2xl font-bold">Quests</Text>
					<TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Map view will be available soon!')}>
						<Ionicons name="map-outline" size={24} className="text-blue-600" />
					</TouchableOpacity>
				</View>
				<Text className="text-sm text-muted-foreground mt-1">
					{DEMO_EVENT_CONTEXT.eventName}
				</Text>
			</View>

			{/* Stats Bar */}
			<View className="px-4 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-border">
				<View className="flex-row justify-around">
					<View className="items-center">
						<Text className="text-2xl font-bold text-blue-600">{completedQuests}</Text>
						<Text className="text-xs text-muted-foreground">Completed</Text>
					</View>
					<View className="items-center">
						<Text className="text-2xl font-bold text-amber-600">{totalPoints}</Text>
						<Text className="text-xs text-muted-foreground">Points</Text>
					</View>
					<View className="items-center">
						<Text className="text-2xl font-bold text-green-600">{totalQuests}</Text>
						<Text className="text-xs text-muted-foreground">Available</Text>
					</View>
				</View>
			</View>

			{/* Category Filter */}
			<View className="px-4 py-3 border-b border-border">
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View className="flex-row space-x-3">
						{(['all', 'location', 'social', 'photo'] as const).map((category) => (
							<TouchableOpacity
								key={category}
								onPress={() => setSelectedCategory(category)}
								className={`flex-row items-center px-4 py-2 rounded-full border ${
									selectedCategory === category
										? 'bg-blue-600 border-blue-600'
										: 'bg-background border-border'
								}`}
							>
								<Ionicons
									name={getQuestTypeIcon(category) as any}
									size={16}
									className={`mr-2 ${
										selectedCategory === category ? 'text-white' : 'text-muted-foreground'
									}`}
								/>
								<Text
									className={`font-medium ${
										selectedCategory === category ? 'text-white' : 'text-foreground'
									}`}
								>
									{getQuestTypeLabel(category)}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>

			{/* Quests List */}
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4">
					{loading ? (
						<View className="items-center py-8">
							<Text className="text-muted-foreground">Loading quests...</Text>
						</View>
					) : filteredQuests.length > 0 ? (
						<View className="space-y-3">
							{filteredQuests.map((questProgress) => (
								<QuestCard
									key={questProgress.quest.id}
									questProgress={questProgress}
									onPress={() => handleQuestPress(questProgress.quest.id)}
									onComplete={() => handleQuestComplete(questProgress.quest.id)}
								/>
							))}
						</View>
					) : (
						<View className="items-center py-8">
							<Ionicons name="trophy-outline" size={48} className="text-muted-foreground mb-3" />
							<Text className="text-lg font-semibold text-foreground mb-2">
								No {selectedCategory === 'all' ? '' : getQuestTypeLabel(selectedCategory) + ' '}Quests
							</Text>
							<Text className="text-muted-foreground text-center">
								{selectedCategory === 'all' 
									? 'Check back later for new quests!' 
									: `No ${getQuestTypeLabel(selectedCategory).toLowerCase()} quests available right now.`
								}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 