import { supabase } from '@/config/supabase';
import { getUserEventStats, getLeaderboard } from '@/lib/api';

export async function queryEventData(question: string): Promise<string> {
  try {
    // Get current data from your existing functions
    const [userStats, leaderboard] = await Promise.all([
      getUserEventStats(),
      getLeaderboard()
    ]);
    
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