import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Quest, QuestProgress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

interface QuestCardProps {
  questProgress: QuestProgress;
  onPress: () => void;
  onComplete?: () => void;
  className?: string;
}

export function QuestCard({ 
  questProgress, 
  onPress, 
  onComplete,
  className 
}: QuestCardProps) {
  const { quest, completion, distance_to_location, is_in_range, can_complete, progress_percentage } = questProgress;
  
  const getQuestIcon = () => {
    switch (quest.quest_type) {
      case 'location':
        return 'location-outline';
      case 'photo':
        return 'camera-outline';
      case 'social':
        return 'people-outline';
      case 'scavenger':
        return 'search-outline';
      case 'sponsor':
        return 'storefront-outline';
      default:
        return 'trophy-outline';
    }
  };

  const getStatusColor = () => {
    if (completion?.verified) return 'text-green-600';
    if (can_complete) return 'text-blue-600';
    if (is_in_range) return 'text-orange-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (completion?.verified) return 'Completed';
    if (can_complete) return 'Ready to Complete';
    if (is_in_range) return 'In Range';
    if (distance_to_location && distance_to_location > quest.location_radius_meters) {
      return `${Math.round(distance_to_location)}m away`;
    }
    return 'Available';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name={getQuestIcon() as any} 
              size={20} 
              className="text-blue-600 mr-2" 
            />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
              {quest.title}
            </Text>
          </View>
          
          <Text className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {quest.description}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="trophy-outline" size={16} className="text-amber-500 mr-1" />
              <Text className="text-amber-600 font-medium text-sm">
                {quest.points_reward} points
              </Text>
            </View>
            
            <Text className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </Text>
          </View>
          
          {/* Progress Bar */}
          {progress_percentage > 0 && (
            <View className="mt-3">
              <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <View 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress_percentage, 100)}%` }}
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Action Button */}
        <View className="ml-4">
          {completion?.verified ? (
            <View className="bg-green-100 dark:bg-green-900 rounded-full p-2">
              <Ionicons name="checkmark" size={20} className="text-green-600" />
            </View>
          ) : can_complete ? (
            <TouchableOpacity
              onPress={onComplete}
              className="bg-blue-600 rounded-full px-4 py-2"
            >
              <Text className="text-white font-medium text-sm">Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
              <Ionicons name="chevron-forward" size={20} className="text-gray-600" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
} 