import { supabase } from '@/config/supabase';
import { getUserEventStats, getLeaderboard } from '@/lib/api';

export async function queryEventData(question: string): Promise<string> {
  try {
    // Get current data from your existing functions
    const [userStats, leaderboard] = await Promise.all([
      getUserEventStats(),
      getLeaderboard()
    ]);
    
    // Temporary bypass for testing - remove this after debugging
    if (question.includes('test')) {
      return `Test response: You have ${userStats.totalPoints} points and rank #${userStats.rank}. ${leaderboard.length} participants in total.`;
    }
    
    console.log('Calling edge function with data:', { 
      question, 
      userStatsKeys: Object.keys(userStats),
      leaderboardLength: leaderboard.length 
    });
    
    // Call Supabase Edge Function (secure)
    const { data, error } = await supabase.functions.invoke('chat-assistant', {
      body: {
        question,
        userStats,
        leaderboard
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }
    
    return data.response || "Sorry, I couldn't process that question right now. Please try again.";
  } catch (error) {
    console.error('Chat assistant error:', error);
    return "Sorry, I couldn't process that question right now. Please try again.";
  }
} 