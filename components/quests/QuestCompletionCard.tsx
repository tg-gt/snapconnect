import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';

interface QuestCompletionCardProps {
  questTitle: string;
  pointsEarned: number;
  onContinue: () => void;
}

export function QuestCompletionCard({ questTitle, pointsEarned, onContinue }: QuestCompletionCardProps) {
  return (
    <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 m-4">
      <View className="items-center">
        {/* Success Icon */}
        <View className="bg-green-100 dark:bg-green-800/30 rounded-full p-4 mb-4">
          <Ionicons name="checkmark-circle" size={48} className="text-green-600" />
        </View>
        
        {/* Title */}
        <Text className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
          Quest Completed! 🎉
        </Text>
        
        {/* Quest Name */}
        <Text className="text-gray-700 dark:text-gray-300 text-center mb-4">
          {questTitle}
        </Text>
        
        {/* Points Earned */}
        <View className="bg-green-100 dark:bg-green-800/30 rounded-lg px-4 py-2 mb-6">
          <Text className="text-green-700 dark:text-green-300 font-semibold text-lg">
            +{pointsEarned} points earned
          </Text>
        </View>
        
        {/* Continue Button */}
        <Button
          onPress={onContinue}
          className="w-full"
        >
          <Text className="text-white font-medium">Continue to Quests</Text>
        </Button>
      </View>
    </View>
  );
} 