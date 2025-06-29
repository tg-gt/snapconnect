import AsyncStorage from '@react-native-async-storage/async-storage';

interface EventContext {
  eventId: string;
  eventName: string;
  participantId: string;
  eventStartDate: string;
  eventEndDate: string;
  joinedAt?: string;
}

interface QuestCompletion {
  questId: string;
  completedAt: string;
  photoUrl?: string;
  pointsEarned: number;
}

const STORAGE_KEYS = {
  EVENT_CONTEXT: 'eventContext',
  QUEST_COMPLETIONS: 'questCompletions',
  USER_POINTS: 'userPoints',
} as const;

// Save event context when joining an event
export async function saveEventContext(context: EventContext & { joinedAt: string }): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EVENT_CONTEXT, JSON.stringify(context));
  } catch (error) {
    console.error('Error saving event context:', error);
    throw error;
  }
}

// Get current event context
export async function getEventContext(): Promise<(EventContext & { joinedAt: string }) | null> {
  try {
    const context = await AsyncStorage.getItem(STORAGE_KEYS.EVENT_CONTEXT);
    return context ? JSON.parse(context) : null;
  } catch (error) {
    console.error('Error getting event context:', error);
    return null;
  }
}

// Save quest completion
export async function saveQuestCompletion(questId: string, data: Omit<QuestCompletion, 'questId'>): Promise<void> {
  try {
    const existingCompletions = await getQuestCompletions();
    
    // Check if quest already completed
    if (existingCompletions.some(c => c.questId === questId)) {
      console.log('Quest already completed:', questId);
      return;
    }
    
    const newCompletion: QuestCompletion = {
      questId,
      ...data
    };
    
    const updatedCompletions = [...existingCompletions, newCompletion];
    await AsyncStorage.setItem(STORAGE_KEYS.QUEST_COMPLETIONS, JSON.stringify(updatedCompletions));
    
    // Update total points
    const totalPoints = updatedCompletions.reduce((sum, c) => sum + c.pointsEarned, 0);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_POINTS, totalPoints.toString());
  } catch (error) {
    console.error('Error saving quest completion:', error);
    throw error;
  }
}

// Get all quest completions
export async function getQuestCompletions(): Promise<QuestCompletion[]> {
  try {
    const completions = await AsyncStorage.getItem(STORAGE_KEYS.QUEST_COMPLETIONS);
    return completions ? JSON.parse(completions) : [];
  } catch (error) {
    console.error('Error getting quest completions:', error);
    return [];
  }
}

// Get user's total points from completions
export async function getUserPoints(): Promise<number> {
  try {
    const points = await AsyncStorage.getItem(STORAGE_KEYS.USER_POINTS);
    return points ? parseInt(points, 10) : 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
}

// Clear all event data (for leaving an event)
export async function clearEventData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.EVENT_CONTEXT,
      STORAGE_KEYS.QUEST_COMPLETIONS,
      STORAGE_KEYS.USER_POINTS,
    ]);
  } catch (error) {
    console.error('Error clearing event data:', error);
    throw error;
  }
}

// Check if quest is completed
export async function isQuestCompleted(questId: string): Promise<boolean> {
  const completions = await getQuestCompletions();
  return completions.some(c => c.questId === questId);
} 