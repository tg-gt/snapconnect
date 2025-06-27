import React from 'react';
import { View, Text } from 'react-native';
import { Quest, QuestCompletion, QuestProgress as QuestProgressType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

interface QuestProgressProps {
  questProgress: QuestProgressType;
  className?: string;
}

export function QuestProgress({ questProgress, className }: QuestProgressProps) {
  const { 
    quest, 
    completion, 
    distance_to_location, 
    is_in_range, 
    can_complete, 
    progress_percentage 
  } = questProgress;

  const getProgressSteps = () => {
    const steps = [];
    
    // Step 1: Quest Available
    steps.push({
      title: 'Quest Available',
      completed: true,
      icon: 'trophy-outline',
      color: 'text-green-600'
    });

    // Step 2: Location-based requirements
    if (quest.location_latitude && quest.location_longitude) {
      steps.push({
        title: `Reach Location (${quest.location_radius_meters}m range)`,
        completed: is_in_range,
        icon: 'location-outline',
        color: is_in_range ? 'text-green-600' : 'text-gray-400',
        subtitle: distance_to_location ? `${Math.round(distance_to_location)}m away` : undefined
      });
    }

    // Step 3: Photo requirements
    if (quest.required_photo) {
      steps.push({
        title: 'Submit Photo',
        completed: completion?.completion_data?.photo_url ? true : false,
        icon: 'camera-outline',
        color: completion?.completion_data?.photo_url ? 'text-green-600' : 'text-gray-400'
      });
    }

    // Step 4: Verification
    if (completion) {
      steps.push({
        title: 'Verification',
        completed: completion.verified,
        icon: completion.verified ? 'checkmark-circle' : 'time-outline',
        color: completion.verified ? 'text-green-600' : 'text-orange-500',
        subtitle: completion.verified ? 'Verified' : 'Pending verification'
      });
    }

    return steps;
  };

  const progressSteps = getProgressSteps();

  return (
    <View className={cn('bg-white dark:bg-gray-800 rounded-xl p-4', className)}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Progress
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress_percentage)}% Complete
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-6">
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <View 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress_percentage, 100)}%` }}
          />
        </View>
      </View>

      {/* Progress Steps */}
      <View className="space-y-4">
        {progressSteps.map((step, index) => (
          <View key={index} className="flex-row items-start">
            <View className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5',
              step.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
            )}>
              <Ionicons 
                name={step.icon as any} 
                size={16} 
                className={step.color}
              />
            </View>
            
            <View className="flex-1">
              <Text className={cn(
                'font-medium',
                step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              )}>
                {step.title}
              </Text>
              {step.subtitle && (
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step.subtitle}
                </Text>
              )}
            </View>
            
            {step.completed && (
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                className="text-green-600 mt-1" 
              />
            )}
          </View>
        ))}
      </View>

      {/* Rewards Preview */}
      {quest.points_reward && (
        <View className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700 dark:text-gray-300 font-medium">
              Reward
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={16} className="text-amber-500 mr-1" />
              <Text className="text-amber-600 font-semibold">
                {quest.points_reward} points
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Time Limit */}
      {quest.time_limit_minutes && (
        <View className="mt-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700 dark:text-gray-300 font-medium">
              Time Limit
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} className="text-blue-600 mr-1" />
              <Text className="text-blue-600 font-medium">
                {quest.time_limit_minutes} min
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
} 